const { confirm, getHour, getTime, back, eventRedBtn, mainmenuBtnCreate, notePreCrBtn, periodBtn } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { delBtnCreator } = require('./coopFunc')
const { usersModel, notesModel, chatModel } = require("./bd");
const { logAdd } = require("./logFunc");
const { where } = require("sequelize");

function monthBuilder(month, year) {
    let nextmonth;
    let nextyear = year
    if (month == 12) {
        nextmonth = 1
        nextyear = year+1
    } else {
        nextmonth = month+1
    }
    const dateStart = new Date(`${year}-${month}-1`); 
    const dateEnd = new Date(`${nextyear}-${nextmonth}-1`);
    const oneDay = 1000 * 60 * 60 * 24; 
    const diffInTime = dateEnd.getTime() - dateStart.getTime();
    const diffInDays = Math.round(diffInTime / oneDay); 
    let dayArray = []
    for (i=0; i<diffInDays; i++) {
        let day = new Date (`${year}-${month}-${i+1}`)
        let dayObj = {
            day: i+1,
            weekday: day.getDay()
        }
        if(dayObj.weekday==0){
            dayObj.weekday=7
        }
        dayArray[i] = dayObj
    }
    let btnArray = []
    let allMonth =['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    btnArray[0] = [{text: `${allMonth[month-1]} ${year}`, callback_data: 'dick'}]
    btnArray[1] = [{text: 'Пн', callback_data: 'dick'}, {text: 'Вт', callback_data: 'dick'},
    {text: 'Ср', callback_data: 'dick'}, {text: 'Чт', callback_data: 'dick'},
    {text: 'Пт', callback_data: 'dick'}, {text: 'Сб', callback_data: 'dick'},
    {text: 'Вс', callback_data: 'dick'}]
    let emptySpace = {day: ' ', weekday:'dick'}
    let different = dayArray[0].weekday -1
    for(i=0; i<different; i++) {
        dayArray.unshift(emptySpace)
    }
    different=7-dayArray[dayArray.length-1].weekday

    for(i=0; i<different;i++){
        dayArray.push(emptySpace)
    }
    for(i=0;i<dayArray.length;i=i+7){
        let transferArray=[]
        for(j=0;j<7;j++){
            let transferObject
            if(dayArray[i+j].day == ' ') {
                transferObject = {text: `${dayArray[i+j].day}`, callback_data: `dick`}
            } else {
                transferObject = {text: `${dayArray[i+j].day}`, callback_data: `${year}-${month}-${dayArray[i+j].day}`}
            }
            
            transferArray.push(transferObject)
        }
        btnArray.push(transferArray)
    }
    btnArray.push([{text: '<', callback_data: 'backmonth'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'nextmonth'} ])
    btn = {
            inline_keyboard: btnArray
    }
    return btn;
}

async function preCreator(note){
    console.log(note);
    if (note.stade == "giveParam") {
        selectType(note)
    } else if (note.stade == 'giveName') {
        if (note.eventName == null) {
            selectName(note)
        } else {
            note.stade = 'giveDate'
            preCreator(note)
        }
    } else if (note.stade == 'giveDate') {
        if (note.date == null) {
            selectDate(note)
        } else if (note.hour == null) {
            selectHour(note)
        } else if (note.min == null) {
            selectMin(note)
        } else {
            note.stade = 'create'
            preCreator(note)
        }
    } else if (note.stade == 'create') {
        if (note.id == null) {
            creator(note)
        } else {
            updater(note)
        }
    }
}

async function selectType(note) {
    async function typeBuilder (msg){
        if (msg.message.chat.id == note.chatid) {
            if (msg.data == 'simplenote') {
                note.type = 'simple'
                if (note.id == null) {
                    note.date = null
                }
                bot.editMessageReplyMarkup(await notePreCrBtn(note), {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'ednote') {
                note.type = 'ed'
                note.date = new Date ().format('Y-M-d')
                note.period = {type:"perday", data: 1}
                bot.editMessageReplyMarkup(await notePreCrBtn(note), {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'pernote') {
                bot.removeListener('callback_query', typeBuilder)
                note.type = 'period'
                periodCreate(note)
            } else if (msg.data == 'selfnote') {
                note.coop = false
                bot.editMessageReplyMarkup(await notePreCrBtn(note), {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'friendnote') {
                note.coop = true
                await bot.editMessageText('Кому отправим уведомление?', {chat_id:note.chatid, message_id:note.message})
                async function addUser (msg) {
                    if (msg.message.chat.id == note.chatid) {
                        if (msg.data != 'coopbackbtn') {
                            bot.removeListener('callback_query', addUser)
                            note.coopid = msg.data
                            bot.deleteMessage(note.chatid, note.message)
                            selectType(note)
                        } else if (msg.data == 'coopbackbtn') {
                            bot.removeListener('callback_query', addUser)
                            note.coop = false
                            bot.deleteMessage(note.chatid, note.message)
                            selectType(note)
                        }
                    }
                }   
                await bot.editMessageReplyMarkup(await delBtnCreator('friend', note.chatid), {chat_id:note.chatid, message_id:note.message})
                bot.on('callback_query', addUser)
            } else if (msg.data == 'notedone') {
                bot.removeListener('callback_query', typeBuilder)
                note.stade = 'giveName'
                preCreator(note)
            } else {
                bot.editMessageText('Вернулись в главное меню', {chat_id:note.chatid, message_id:note.message})
                bot.removeListener('callback_query', typeBuilder)
            }
        }
    }
    let mess = await bot.sendMessage(note.chatid, 'Выбери параметры уведомления:', {reply_markup: JSON.stringify(await notePreCrBtn(note))})
    note.message = mess.message_id
    bot.on('callback_query', typeBuilder)
    
}

async function periodCreate (note) {
    let period = {type: null, data: null}
    async function perBuilder(msg) {
        if (msg.message.chat.id == note.chatid) {
            if (msg.data == 'perweek') {
                period.type = msg.data
                period.data = {
                    mon: false,
                    tue: false,
                    wed: false,
                    thu:false,
                    fri:false,
                    sat:false,
                    sun:false,
                }
                bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'permount') {
                period.type = msg.data
                period.data = null
                bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'perday') {
                period.type = msg.data
                async function addDays(msg) {
                    if (msg.chat.id == note.chatid) {
                        if (Number.isInteger(Number(msg.text))) {
                            period.data = msg.text
                            bot.removeListener('message', addDays)
                            await bot.editMessageText('Выбери параметры уведомления:', {chat_id:note.chatid, message_id:note.message})
                            await bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                        } else {
                            bot.sendMessage(note.chatid, 'Введи число')
                        }   
                    }
                }
                bot.on('message', addDays)
                bot.editMessageText('Укажи раз в сколько дней повторять уведомление', {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'monper'){
                if (period.data.mon == false) {
                    period.data.mon = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.mon = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'tueper'){
                if (period.data.tue == false) {
                    period.data.tue = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.tue = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'wedper'){
                if (period.data.wed == false) {
                    period.data.wed = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.wed = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'thuper'){
                if (period.data.thu == false) {
                    period.data.thu = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.thu = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'friper'){
                if (period.data.fri == false) {
                    period.data.fri = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.fri = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'satper'){
                if (period.data.sat == false) {
                    period.data.sat = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.sat = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'sunper'){
                if (period.data.sun == false) {
                    period.data.sun = true
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                } else {
                    period.data.sun = false
                    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
                }
                
            } else if (msg.data == 'perdone') {
                bot.removeListener('callback_query', perBuilder)
                bot.deleteMessage(note.chatid,note.message)
                note.period = period
                selectType(note)
            } else if (msg.data == 'backtoper') {
                period.type = null
                bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
            } else if (msg.data == 'perback') {
                bot.removeListener('callback_query', perBuilder)
                note.type = 'simple'
                selectType(note)
            } else {
                bot.removeListener('callback_query', perBuilder)
                bot.deleteMessage(note.chatid, note.message)
            }
        }
    } 
    bot.on('callback_query', perBuilder)
    bot.editMessageReplyMarkup(await periodBtn(period), {chat_id:note.chatid, message_id:note.message})
}

async function selectName(note){
    async function nameGiver(msg) {
        if (msg.chat.id == note.chatid) {
            bot.removeListener('message', nameGiver)
            note.eventName = msg.text
            async function nameConfirm(msg) {
                if (msg.message.chat.id == note.chatid) {
                    if (msg.data == 'confirmanswer') {
                        bot.removeListener('callback_query', nameConfirm)
                        bot.deleteMessage(note.chatid,note.message)
                        note.stade = 'giveDate'
                        preCreator(note)
                    }
                    if (msg.data == 'nameback') {
                        bot.removeListener('callback_query', nameConfirm)
                        bot.deleteMessage(note.chatid, note.message)
                        note.stade = 'giveParam'
                        note.eventName = null
                        preCreator(note)
                    }
                }
            }
            bot.on('callback_query', nameConfirm)
            let mess = await bot.sendMessage(note.chatid, `Событие будет называться "${note.eventName}"?`, confirm)
            bot.deleteMessage(note.chatid, note.message)
            note.message = mess.message_id
        }
    }    
    bot.on('message', nameGiver)
    bot.editMessageText('Теперь укажи название', {chat_id:note.chatid, message_id:note.message})
}

async function selectDate (note) {
    let year = Number(new Date().format('Y'))
    let month = Number(new Date().format('M'))
    let btn = {reply_markup: JSON.stringify(
        monthBuilder(month, year)
    )}
    async function addDate(msg){
        if (msg.message.chat.id==note.chatid) {
            if (msg.data != 'dick') {
                if (msg.data !== 'backmonth' && msg.data !== 'nextmonth' && msg.data !== 'back') {
                    bot.removeListener('callback_query', addDate)
                    note.date = msg.data
                    bot.deleteMessage(note.chatid, note.message)
                    preCreator(note)
                } else if (msg.data === 'backmonth') {
                    if(month == 1) {
                        month = 12
                        year--
                    } else {
                        month--
                    }
                    btn = monthBuilder(month, year)
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                } else if (msg.data === 'nextmonth') {
                    if (month == 12) {
                        month = 1
                        year++ 
                    } else {
                        month ++
                    }
                    btn = monthBuilder(month, year)
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                } else if (msg.data == 'back'){
                    bot.removeListener('callback_query', addDate)
                    note.stade = 'giveParam'
                    bot.deleteMessage(note.chatid,note.message)
                    preCreator(note)
                }
            }
        }
    }
    bot.on('callback_query', addDate)
    let mess = await bot.sendMessage(note.chatid, 'Укажи дату:', btn)
    note.message = mess.message_id
}
async function selectHour (note) {
    async function addHour(msg){
        if (msg.message.chat.id==note.chatid) {
            if (msg.data != 'dick') {
                if (msg.data !== "hourback" && msg.data !== 'hournext' && msg.data !== 'back') {
                    bot.removeListener('callback_query', addHour)
                    note.hour = msg.data
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                    let getmin = [
                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                        [{text: 'Указать минуты вручную', callback_data: 'minhandmode'}],
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                    preCreator(note)
                } else if (msg.data === "hourback") {
                    const oneDay = 1000 * 60 * 60 * 24; 
                    note.date = new Date(note.date).getTime() - oneDay
                    note.date = new Date(note.date).format('Y-M-d')
                    let backday = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        backday.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: backday
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                } else if (msg.data === "hournext") {
                    const oneDay = 1000 * 60 * 60 * 24; 
                    note.date = new Date(note.date).getTime() + oneDay
                    note.date = new Date(note.date).format('Y-M-d')
                    let backday = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        backday.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: backday
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                } else if (msg.data === 'back') {
                    bot.removeListener('callback_query', addHour)
                    if (note.type == 'ed') {
                        note.stade = 'giveParam'
                    } else {
                        note.date = null
                    }
                    bot.deleteMessage(note.chatid,note.message)
                    preCreator(note)
                }
            }
        }
    }
    bot.on('callback_query', addHour)
    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
    for (i=0; i<getHour.length; i++){
        newBtn.push(getHour[i])
    }
    btn = {
        inline_keyboard: newBtn
    }
    let mess = await bot.sendMessage(note.chatid, 'Укажи время:', {reply_markup: JSON.stringify(btn)})
    note.message = mess.message_id
}
async function selectMin (note) {
    async function addMin(msg){
        if (msg.message.chat.id==note.chatid) {
            if (msg.data != 'dick') {
                if (msg.data !== "minback" && msg.data !== 'minnext' && msg.data !== 'back' && msg.data != 'minhandmode') {
                    bot.removeListener('callback_query', addMin)
                    note.min = msg.data
                    if (note.type == 'ed') {
                        let noteDate = new Date (note.date)
                        noteDate = new Date (noteDate).setHours(note.hour)
                        noteDate = new Date (noteDate).setMinutes(note.min)
                        noteDate = new Date (noteDate).getTime()
                        let dateNow = new Date()
                        dateNow =new Date(dateNow).getTime()
                        if (noteDate < dateNow) {
                            noteDate = new Date (noteDate).setDate(new Date (noteDate).getDate()+1)
                            note.date = new Date (noteDate).format('Y-M-d')
                        }
                    }
                    note.stade = 'create'
                    bot.deleteMessage(note.chatid, note.message)
                    preCreator(note)
                } else if (msg.data === "minback") {
                    note.hour--
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                    let getmin = [
                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                } else if (msg.data === "minnext") {
                    note.hour++
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                    let getmin = [
                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                } else if (msg.data === "back") {
                    bot.removeListener('callback_query', addMin)
                    note.hour = null
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        newBtn.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                    bot.deleteMessage(note.chatid,note.message)
                    preCreator(note)
                } else if (msg.data === 'minhandmode') {
                    bot.removeListener('callback_query', addMin)
                    async function minAdd(msg) {
                        if (msg.text >= 0 && msg.text < 60) {
                            note.min = msg.text
                            if (note.type == 'ed') {
                                let noteDate = new Date (note.date)
                                noteDate = new Date (noteDate).setHours(note.hour)
                                noteDate = new Date (noteDate).setMinutes(note.min)
                                noteDate = new Date (noteDate).getTime()
                                let dateNow = new Date()
                                dateNow =new Date(dateNow).getTime()
                                if (noteDate < dateNow) {
                                    noteDate = new Date (noteDate).setDate(new Date (noteDate).getDate()+1)
                                    note.date = new Date (noteDate).format('Y-M-d')
                                }
                            }
                            bot.removeListener('message', minAdd)
                            note.stade = 'create'
                            bot.deleteMessage(note.chatid, note.message)
                            preCreator(note)
                        } else {
                            bot.sendMessage(note.chatid, 'Минуты указал неверно, укажи число от 0 до 59')
                        }
                    }
                    bot.on('message', minAdd)
                    bot.editMessageText('Введи минуты', {chat_id: note.chatid, message_id: note.message})
                }
            }
        }
    }
    bot.on('callback_query', addMin)
}

async function creator (note) {
    let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
    let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
    date = new Date(date).setHours(new Date(date).getHours()-user.timediff+5)
    let chatid, coopid
    if (note.coop == false) {
        chatid = note.chatid
        coopid = 0
    } else {
        chatid = note.coopid
        coopid = note.chatid
    }
    notesModel.create({
        chatid:chatid,
        notename: note.eventName,
        notedate: date,
        type: note.type,
        coop: note.coop,
        coopid: coopid,
        period: JSON.stringify(note.period)
    }).then(async res=>{
        logAdd('Add note ' + JSON.stringify(res))
        await bot.sendMessage(note.chatid, `Напомню про "${note.eventName}" ${new Date(note.date).format('d.M.Y')} в ${note.hour}:${note.min}`)
        await bot.sendMessage(note.chatid, 'Вернулись в главное меню', await mainmenuBtnCreate(note.chatid))
    }).catch(err=>{
        logAdd('Add note err' + err)
        bot.sendMessage(902064437, "Йо тут ошибка " + err);
        bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз позже.")
    })
}

async function updater (note) {
    let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
    let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
    if (note.editDate == true) {
        date = new Date(date).setHours(new Date(date).getHours()-user.timediff+5)
    } else {
        date = new Date(date).setHours(new Date(date).getHours()-user.timediff)
    }
    let chatid, coopid
    if (note.coop == false) {
        chatid = note.chatid
        coopid = 0
    } else {
        chatid = note.coopid
        coopid = note.chatid
    }
    notesModel.update({
        chatid: chatid,
        notename: note.eventName,
        notedate: date,
        type: note.type,
        period: JSON.stringify(note.period),
        coop: note.coop,
        coopid: coopid,
    }, {where:{id:note.id}}).then(res=>{
        bot.deleteMessage(note.chatid, note.message)
        bot.sendMessage(note.chatid, 'Уведомление отредактировано.',back)
        logAdd(`updated note ${res} \n ${JSON.stringify(note, null, '\t')}`)
    }).catch(err=>{
        logAdd('Add note err' + err)
        bot.sendMessage(902064437, "Йо тут ошибка " + err);
        bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз позже.")
    })
    
}

module.exports.preCreator = preCreator
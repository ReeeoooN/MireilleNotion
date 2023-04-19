const { confirm, getHour, getTime, back, replyBack, eventRedBtn, mainmenuBtnCreate } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { delBtnCreator } = require('./coopFunc')
const { usersModel, notesModel, chatModel } = require("./bd");
const { logAdd } = require("./logFunc");

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
    btnArray.push([{text: '<', callback_data: 'backmonth'}, {text: 'Назад', callback_data:'start'}, {text: '>', callback_data: 'nextmonth'} ])
    btn = {
            inline_keyboard: btnArray
    }
    return btn;
}

async function preCreator({everyday, coop, chatid}){
    logAdd(`PreCreate everyday:${everyday}, coop:${coop}`)
    let note = {date: 0, hour: 0, min: 0, eventName: 0, chatid: chatid, message: 0, everyday: false, coop: false, coopid: 0}
    if (everyday == true) {
        note.everyday =true
        note.date = new Date ().format('Y-M-d')
    }
    if (coop == true) {
        note.coop = true
        let mess = await bot.sendMessage(chatid, 'Кому отправим уведомление?')
        async function addUser (msg) {
            if (msg.message.chat.id == chatid && msg.data != 'start') {
                bot.removeListener('callback_query', addUser)
                bot.deleteMessage(chatid, mess.message_id)
                note.coopid = msg.data
                creator(note, chatid)
            } else if (msg.message.chat.id == chatid && msg.data == 'start') {
                bot.removeListener('callback_query', addUser)
                bot.deleteMessage(chatid, mess.message_id)
            }
        }
        bot.editMessageReplyMarkup(await delBtnCreator('friend', chatid), {chat_id: chatid, message_id: mess.message_id})
        bot.on('callback_query', addUser)
    } else {
        creator(note, chatid)
    }
    
}

async function creator(note, chatid){
    let mess = await bot.sendMessage(chatid, 'Введи название события', replyBack)
    createChatDB(chatid, mess.message_id)
    let eventName = new Promise((resolve, reject) => {
        async function giveName (msg) {
            if ((msg.text !== '/start' && msg.chat.id === chatid) && (msg.text !== 'Назад' && msg.chat.id === chatid)) {
                note.eventName = msg.text
                bot.removeListener('message', giveName)
                resolve(note)
                
            } else if ((msg.text === '/start' && msg.chat.id === chatid) || (msg.text === 'Назад' && msg.chat.id === chatid)) {
                bot.removeListener('message', giveName)
                reject({chatid: note.chatid, message:  note.message, text: msg.text})
            }
        }
        bot.on('message', giveName)
    }).then(async note=>{
        deleteBotMessage(note.chatid)
        let mess = await bot.sendMessage(note.chatid, `Событие будет называться "${note.eventName}"?`, confirm)
        createChatDB(chatid, mess.message_id)
        let eventNameConfirm = new Promise (async (resolve, reject)=>{
            async function nameConfirm(msg) {
                if (msg.data == 'confirmanswer' && msg.message.chat.id === chatid) {
                    bot.removeListener('callback_query', nameConfirm)
                    resolve(note)
                }
                if (msg.data == 'start') {
                    bot.removeListener('callback_query', nameConfirm)
                    chatModel.destroy({where:{messageid: mess.message_id}})
                    reject({chatid: note.chatid, message: mess.message_id})
                }
            }
            bot.on('callback_query', nameConfirm)
        }).then(async note=>{
            deleteBotMessage(note.chatid)
            let year = Number(new Date().format('Y'))
            let month = Number(new Date().format('M'))
            let btn; 
            if (note.date === 0) {
                btn = {reply_markup: JSON.stringify(
                    monthBuilder(month, year)
                )} 
                let mess = await bot.sendMessage(chatid, 'Укажи дату:', btn)
                note.message = mess.message_id
            } else {
                let newBtn = []
                for (i=0; i<getHour.length; i++){
                    newBtn.push(getHourfored[i])
                }
                btn = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: newBtn
                    })
                }
                let mess = await bot.sendMessage(chatid, 'Укажи время:', btn)
                note.message = mess.message_id
            }
            let eventDate = new Promise ( async(resolve,reject)=>{
                async function dateBuilder(msg) {
                    if(msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data !== 'myEdNote' && msg.data !== 'myinfo' ) {
                        if (note.date === 0) {
                            if (msg.data !== 'backmonth' && msg.data !== 'nextmonth' ) {
                                note.date = msg.data
                                let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                                for (i=0; i<getHour.length; i++){
                                    newBtn.push(getHour[i])
                                }
                                btn = {
                                    inline_keyboard: newBtn
                                }
                                bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
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
                            }
                        } else if (note.hour === 0) {
                            if (msg.data !== "hourback" && msg.data !== 'hournext' && msg.data !== 'back') {
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
                                note.date = 0
                                let year = Number(new Date().format('Y'))
                                let month = Number(new Date().format('M'))
                                btn = monthBuilder(month, year)
                                bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                            }
                        } else if (note.min === 0) {
                            if (msg.data !== "minback" && msg.data !== 'minnext' && msg.data !== 'back' && msg.data != 'minhandmode') {
                                note.min = msg.data
                                if (note.everyday == true) {
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
                                if (note.everyday == true) {
                                    bot.editMessageText(`Напомню про "${note.eventName}" в ${note.hour}:${note.min}`, {chat_id:note.chatid,message_id:note.message})
                                } else {
                                    bot.editMessageText(`Напомню про "${note.eventName}" ${new Date(note.date).format('d.M.Y')} в ${note.hour}:${note.min}`, {chat_id:note.chatid,message_id:note.message})
                                }
                                let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
                                let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
                                date = new Date(date).setHours(new Date(date).getHours()-user.timediff+5)
                                if (note.coop == false) {
                                    await notesModel.create({
                                        chatid: note.chatid,
                                        notedate: `${new Date(date).format(`Y-M-d H:m`)}`,
                                        notename: note.eventName,
                                        everyday: note.everyday
                                    }).catch(err=>{
                                        usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                            console.log("Error - " + err);
                                            for (i=0; i<res.length; i++){
                                                bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                                
                                            }
                                            bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз.")
                                        })
                                    })
                                } else {
                                    await notesModel.create({
                                        chatid: note.coopid,
                                        notedate: new Date(date),
                                        notename: note.eventName,
                                        everyday: note.everyday,
                                        coop: true
                                    }).catch(err=>{
                                        usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                            console.log("Error - " + err);
                                            for (i=0; i<res.length; i++){
                                                bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                                
                                            }
                                            bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз.")
                                        })
                                    })
                                }
                                bot.removeListener('callback_query', dateBuilder)
                                resolve(note)
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
                                note.hour = 0
                                let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                                for (i=0; i<getHour.length; i++){
                                    newBtn.push(getHour[i])
                                }
                                btn = {
                                    inline_keyboard: newBtn
                                }
                                bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                            } else if (msg.data === 'minhandmode') {
                                bot.removeListener('callback_query', dateBuilder)
                                async function minAdd(msg) {
                                    if (msg.text >= 0 && msg.text < 60) {
                                        note.min = msg.text
                                        if (note.everyday == true) {
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
                                        if (note.everyday == true) {
                                            bot.editMessageText(`Напомню про "${note.eventName}" в ${note.hour}:${note.min}`, {chat_id:note.chatid,message_id:note.message})
                                        } else {
                                            bot.editMessageText(`Напомню про "${note.eventName}" ${new Date(note.date).format('d.M.Y')} в ${note.hour}:${note.min}`, {chat_id:note.chatid,message_id:note.message})
                                        }
                                        let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
                                        let date = new Date(note.date).setMilliseconds(0)
                                        date = new Date(date).setSeconds(0)
                                        date = new Date(date).setMinutes(note.min)
                                        date = new Date(date).setHours(note.hour)
                                        date = new Date(date).setHours(new Date(date).getHours()-user.timediff+5)
                                        if (note.coop == false) {
                                            await notesModel.create({
                                                chatid: note.chatid,
                                                notedate: new Date(date),
                                                notename: note.eventName,
                                                everyday: note.everyday
                                            }).catch(err=>{
                                                usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                                    console.log("Error - " + err);
                                                    for (i=0; i<res.length; i++){
                                                        bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                                        
                                                    }
                                                    bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз.")
                                                })
                                            })
                                        } else {
                                            await notesModel.create({
                                                chatid: note.coopid,
                                                notedate: new Date(date),
                                                notename: note.eventName,
                                                everyday: note.everyday,
                                                coop: true
                                            }).catch(err=>{
                                                usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                                    console.log("Error - " + err);
                                                    for (i=0; i<res.length; i++){
                                                        bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                                        
                                                    }
                                                    bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз.")
                                                })
                                            })
                                        }
                                        bot.removeListener('message', minAdd)
                                        resolve(note)
                                    } else {
                                        bot.sendMessage(note.chatid, 'Минуты указал неверно, укажи число от 0 до 59')
                                    }
                                }
                                bot.on('message', minAdd)
                                bot.editMessageText('Введи минуты', {chat_id: note.chatid, message_id: note.message})
                            }
                        }
                    } else if (msg.data === 'start') {
                        bot.removeListener('callback_query', dateBuilder)
                        reject({chatid:note.chatid,message:note.message})
                    }
                }
                bot.on('callback_query', dateBuilder)
            }).then(async note=>{
                logAdd(`Created note ${JSON.stringify(note)}`)
                let mess = await bot.sendMessage(note.chatid, 'Мы вернулись в главное меню', await mainmenuBtnCreate(note.chatid))
                createChatDB(note.chatid, mess.message_id)
            }).catch(err=>{
                bot.editMessageText('Ты вернулся в главное меню', {chat_id: err.chatid, message_id:err.message})
            })
        }).catch(err=>{
            bot.editMessageText('Ты вернулся в главное меню', {chat_id: err.chatid, message_id:err.message})
        })

    }).catch(async err=>{
        if (err.text !== 'Назад') {
            chatModel.destroy({where:{messageid: err.message}})
            bot.editMessageText('Команда не может быть названием', {chat_id: err.chatid, message_id: err.message})
        } else {
            let mess = await bot.sendMessage(err.chatid, 'Ты вернулся в главное меню', await mainmenuBtnCreate(err.chatid))
            createChatDB(note.chatid, mess.message_id)
        }
    })
}


module.exports.monthBuilder = monthBuilder;
module.exports.creator = creator;
module.exports.preCreator = preCreator

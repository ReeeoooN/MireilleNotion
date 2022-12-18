const { confirm, getHour, getTime, back } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel } = require("./bd");
const { where } = require("sequelize");

function fuck (chatid, err) {
    bot.sendMessage(chatid, 'Простите, я сломался, разработчик уже в курсе неполадки, вскоре их поправят')
    bot.sendMessage(902064437, `Бро, я сломался ${err}`)
}

async function regUser(chatid) {
    let hour = 0; 
    let mess = await bot.sendMessage(chatid, 'Хочу определить твой часовой пояс. Который час?', getTime)
    let listener = new Promise ( (resolve, reject)=>{
        function listener (msg) {
            if(msg.message.chat.id === chatid && msg.data !== 'start' && msg.data !== 'noteAdd' && msg.data !== 'myNote') {
                hour = msg.data
                resolve({hour: hour, chatid: chatid, message: mess.message_id})
                bot.removeListener('callback_query',listener)
            } else {
                reject({chatid: chatid, message:mess.message_id})
                bot.removeListener('callback_query',listener)
            }
        }
        bot.on('callback_query', listener)
    }).then(async res=>{
        bot.deleteMessage(res.chatid, res.message)
        let date = new Date(`2022-12-12T${res.hour}:00:00`)
        let differenthour = 1000 * 60 * 60 * 7
        date = date.getTime() - differenthour
        let newdate = new Date(date)
        console.log(date, `19-12-22T${res.hour}:00`, newdate);
        //usersModel.create({
            //id: res.chatid,
          //  timediff: res.hour
        //})
        await bot.sendMessage(res.chatid, 'Спасибо, я тебя запомнил, благодаря указанному времени я смогу отправлять тебе уведомления в твоем часовом поясе')
        let mess = await bot.sendMessage(res.chatid, 'Создадим напоминание?', mainmenu)
        createChatDB(res.chatid, mess.message_id)
    }).catch(err=>{
        bot.editMessageText('Как-то, что-то не то указано, можете попробовать еще раз', {chat_id: err.chatid, message_id: err.message})
    })
}

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

async function notecreator(chatid) {
    let mess = await bot.sendMessage(chatid, 'Введи название события')
    let listener = new Promise (async (resolve, reject)=>{
        function list (msg) {
            if (chatid === msg.chat.id && msg.text != '/start') {
                resolve(msg.text)
                bot.removeListener('message', list)
            } else {
                reject('Ты ввел команду, можешь попробовать еще раз')
                bot.removeListener('message', list)
            }
        }
        bot.on('message', list)
    }).then(async res=>{
        deleteBotMessage(chatid)
        let mess = await bot.sendMessage(chatid, `Событие будет называться "${res}"?`, confirm)
        createChatDB(chatid, mess.message_id)
        listener = new Promise (async (resolve, reject)=>{
            function list (msg){
                if (msg.data == 'confirmanswer' && msg.message.chat.id === chatid) {
                    resolve(res)
                    bot.removeListener('message', list)
                }
                if (msg.data == 'start') {
                    reject('back')
                    bot.removeListener('message', list)
                }
            }
            bot.on('callback_query', list)
        }).then(async res=>{
            deleteBotMessage(chatid)
            let year = Number(new Date().format('Y'))
                let month = Number(new Date().format('M'))
                   let btn = {reply_markup: JSON.stringify(
                    monthBuilder(month, year)
                   )} 
                let mess = await bot.sendMessage(chatid, 'Укажи дату:', btn)
                let note = {date: 0, hour: 0, min: 0, eventName: res, chatid: chatid, message: mess.message_id}
                listener = new Promise (async(resolve, reject)=>{
                    function list (msg){
                        if(msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' ) {
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
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                                } else if (msg.data === 'backmonth') {
                                    if(month == 1) {
                                        month = 12
                                        year--
                                    } else {
                                        month--
                                    }
                                    btn = monthBuilder(month, year)
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                                } else if (msg.data === 'nextmonth') {
                                    if (month == 12) {
                                        month = 1
                                        year++ 
                                    } else {
                                        month ++
                                    }
                                    btn = monthBuilder(month, year)
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
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
                                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'start'}, {text: '>', callback_data: 'minnext'}]
                                    ]
                                    for (i=0; i<getmin.length; i++){
                                        newBtn.push(getmin[i])
                                    }
                                    btn = {
                                        inline_keyboard: newBtn
                                    }
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
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
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
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
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                                } else if (msg.data === 'back') {
                                    note.date = 0
                                    let year = Number(new Date().format('Y'))
                                    let month = Number(new Date().format('M'))
                                    btn = monthBuilder(month, year)
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                                }
                            } else if (note.min === 0) {
                                if (msg.data !== "minback" && msg.data !== 'minnext' && msg.data !== 'back') {
                                    note.min = msg.data
                                    resolve(note)
                                    bot.removeListener('message', list)
                                } else if (msg.data === "minback") {
                                    note.hour--
                                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                                    let getmin = [
                                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'start'}, {text: '>', callback_data: 'minnext'}]
                                    ]
                                    for (i=0; i<getmin.length; i++){
                                        newBtn.push(getmin[i])
                                    }
                                    btn = {
                                        inline_keyboard: newBtn
                                    }
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
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
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                                } else if (msg.data === "back") {
                                    note.hour = 0
                                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                                    for (i=0; i<getHour.length; i++){
                                        newBtn.push(getHour[i])
                                    }
                                    btn = {
                                        inline_keyboard: newBtn
                                    }
                                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                                }
                            }
                        } else if (msg.data === 'start') {
                            reject({chatid:chatid,message:mess.message_id})
                            bot.removeListener('message', list)
                        } else if (msg.data !== 'dick') {
                            reject(mess)
                            bot.removeListener('message', list)
                        }
                    }
                    bot.on('callback_query', list)
                }).then (async res=>{
                    bot.deleteMessage(res.chatid, res.message)
                    bot.sendMessage(res.chatid, `Напомню про "${res.eventName}" ${new Date(res.date).format('d.M.Y')} в ${res.hour}:${res.min}`)
                    let mess = await bot.sendMessage(res.chatid, 'Уведомление создано.', back)
                    createChatDB(res.chatid, mess.message_id)
                    let user = await usersModel.findOne({where:{id:res.chatid}, raw:true})
                    res.hour = res.hour - user.timediff
                    notesModel.create({
                        chatid: res.chatid,
                        notedate: `${res.date} ${res.hour}:${res.min}:00`,
                        notename: res.eventName
                    })
                }).catch(err=>{
                    bot.deleteMessage(err.chatid, err.message)
                })
        }).catch (err=>{
            
        })
    }).catch(err =>{
        bot.editMessageText(err, {chat_id: chatid, message_id: mess.message_id})
    }) 
}

async function selectNotes (chatid) {
    deleteBotMessage(chatid)
    res = await notesModel.findAll({where:{chatid:chatid}, raw:true})
    if(res.length > 0) {
        let user = await usersModel.findOne({where:{id: res[0].chatid}, raw:true})
        for(i=0;i<res.length;i++) {
            let delBtn = {
                reply_markup: JSON.stringify( {
                    inline_keyboard: [
                        [{text: 'Удалить', callback_data: `${res[i].id}`}],
                    ]
                })
            }
            let date = new Date(res[i].notedate)
            date = date.setHours(date.getHours()+user.timediff)
            let mess = await bot.sendMessage(res[i].chatid, `Уведомление "${res[i].notename}" - ${new Date(date).format('d.M.Y h:m')}`, delBtn) 
            createChatDB(res[i].chatid, mess.message_id)
        }
        let mess = await bot.sendMessage(res[0].chatid, 'Это были все уведомления', back)
        createChatDB(res[0].chatid, mess.message_id)
        function listener (msg) {
            console.log(msg.data);
            if(msg.message.chat.id === res[0].chatid && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' ){
                chatModel.destroy({where:{messageid: msg.message.message_id}})
                bot.editMessageText('Уведомление было удалено', {chat_id: res[0].chatid, message_id: msg.message.message_id})
                notesModel.destroy({where:{id: msg.data}})
            }
            if(msg.message.chat.id === res[0].chatid && (msg.data === 'start' || msg.data === 'noteAdd' || msg.data === 'myNote')) {
                bot.removeListener('callback_query', listener)
                if (msg.data !== 'start') {
                    chatModel.findAll({where:{chatid:chatid}}).then(res=>{
                        if (res.length > 0) {
                           for(i=0;i<res.length;i++){
                            bot.deleteMessage(res[i].chatid,res[i].messageid)
                            chatModel.destroy({where:{messageid: res[i].messageid}})
                           }
                        }
                    })
                }
            }
        }
        bot.on('callback_query', listener)
    } else {
        let mess = await bot.sendMessage(chatid, 'Уведомлений нет', back)
        createChatDB(chatid, mess.message_id)
    }
}



module.exports.selectNotes =selectNotes
module.exports.regUser = regUser
module.exports.fuck = fuck
module.exports.notecreator = notecreator
module.exports.monthBuilder = monthBuilder
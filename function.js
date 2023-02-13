const { confirm, getHour, getTime, back, replyBack, mainmenu, eventRedBtn } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel } = require("./bd");

function fuck (chatid) {
    notesModel.findAll({where:{everyday:true}}).then(async res=>{
        for(i=0;i<res.length;i++){
            let noteDate = new Date (res[i].notedate)
            noteDate = new Date (noteDate).getTime()
            let dateNow = new Date()
            dateNow =new Date(dateNow).getTime()
            if (noteDate < dateNow) {
                noteDate = new Date (noteDate).setDate(new Date (noteDate).getDate()+1)
                notesModel.update({notedate: new Date (noteDate).format(`Y-M-d H:m`)}, {where:{id:res[i].id}})
            }
        }
        let mess = await bot.sendMessage(chatid, "done", back)
        createChatDB(chatid, mess.message_id)
    })
}

async function sorrySend(chatid) {
    usersModel.findAll({raw:true}).then(async users =>{
        for(i=0;i<users.length;i++){
            bot.sendMessage(users[i].id, `Разбежавшись прыгнул со скалы... И сломался я. \n Сейчас я работаю, ежедневные уведомления, о которых я не уведомил, сработают завтра, сорри. Обычные уведомления можно отредактировать или удалить по кнопке "Мои уведомления"`)
        }
    })
    bot.sendMessage(chatid, 'done', back)
}

async function updateSend(chatid) {
    usersModel.findAll({raw:true}).then(async users =>{
        for(i=0;i<users.length;i++){
            let str = '';
            let userNotes = await notesModel.findAll({where:{chatid:users[i].id}, raw:true})
            for (j=0;j<userNotes.length;j++){
                if (userNotes[j].everyday = 1) {
                    str = str + `Ежедневное уведомление: "${userNotes[j].notename}", должен уведомить ${new Date (userNotes[j].notedate).format(`d.M.Y H:m`)}\n`
                } else { 
                    str = str + `Уведомление: "${userNotes[j].notename}", должен уведомить ${new Date (userNotes[j].notedate).format(`d.M.Y H:m`)}\n`
                }
            }
            bot.sendMessage(users[i].id, `Разработчик залез в мой код, временно могу не работать, сорри. Список уведомлений:\n ${str}`)
            str = '';
        }
    })
    bot.sendMessage(chatid, 'done', back)
}

async function regUser(chatid, name) {
    let note = {date: 0, hour:0, chatid:chatid}
    let year = Number(new Date().format('Y'))
    let month = Number(new Date().format('M'))
    let btnDateBack = new Date ().setDate(new Date().getDate()-1)
    let btnDateNext = new Date ().setDate(new Date().getDate()+1)
    let btn = {
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [{text: `${new Date (btnDateBack).format('d.M.Y')}`, callback_data: `${new Date (btnDateBack).format('Y-M-d')}`},
                {text: `${new Date ().format('d.M.Y')}`, callback_data: `${new Date ().format('Y-M-d')}`},
                {text: `${new Date (btnDateNext).format('d.M.Y')}`, callback_data: `${new Date (btnDateNext).format('Y-M-d')}`}
                ],
            ]
        })
    } 
    let mess = await bot.sendMessage(chatid, 'Хочу определить твой часовой пояс. укажи дату', btn)
    let regDate = new Promise ( (resolve, reject)=>{
        async function regEvent (msg) {
            if(msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data !== 'myEdNote' && msg.data !== 'myinfo') {
                if (note.date === 0) {
                    if (msg.data !== 'backmonth' && msg.data !== 'nextmonth' ) {
                        note.date = msg.data
                        let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                        for (i=0; i<getTime.length; i++){
                            newBtn.push(getTime[i])
                        }
                        btn = {
                            inline_keyboard: newBtn
                        }
                        await bot.editMessageText('Хочу определить твой часовой пояс. Который час?',{chat_id: chatid, message_id: mess.message_id})
                        await bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
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
                        bot.removeListener('callback_query', regEvent)
                        note.hour = msg.data
                        let userDate = new Date(`${note.date}T${note.hour}:00`).getTime()
                        let serverDate = new Date().getTime()
                        serverDate = new Date(serverDate).setMinutes(00)
                        serverDate = new Date(serverDate).setSeconds(00)
                        serverDate = new Date(serverDate).setMilliseconds(0)
                        let datediff = (userDate - serverDate)/60/60/1000
                        usersModel.create({
                            id: note.chatid,
                            timediff: datediff,
                            name: name,
                            isadmin: false
                        }).catch(err=>{
                            usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                console.log("Error - " + err);
                                for (i=0; i<res.length; i++){
                                    bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                    bot.sendMessage(note.chatid, "Произошла ошибка, попробуйте еще раз.")
                                }
                            })
                        })
                        bot.editMessageText('Спасибо, я тебя запомнил, благодаря указанному времени я смогу отправлять тебе уведомления в твоем часовом поясе', {chat_id: chatid, message_id:mess.message_id})
                        resolve(note.chatid)
                    } else if (msg.data === "hourback") {
                        const oneDay = 1000 * 60 * 60 * 24; 
                        note.date = new Date(note.date).getTime() - oneDay
                        note.date = new Date(note.date).format('Y-M-d')
                        let backday = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                        for (i=0; i<getTime.length; i++){
                            backday.push(getTime[i])
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
                        for (i=0; i<getTime.length; i++){
                            backday.push(getTime[i])
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
                } 
            } else if (msg.data === 'start') {
                bot.removeListener('callback_query', regEvent)
                reject({chatid:chatid,message:mess.message_id})
            }
        }
        bot.on('callback_query', regEvent)
    }).then(async res=>{
        let mess = await bot.sendMessage(res, 'Создадим напоминание?', mainmenu)
        createChatDB(res, mess.message_id)
    }).catch(err=>{
        bot.editMessageText('Без указания даты я не смогу отправлять уведомления в твоем часовом поясе. Ты можешь попробовать еще раз по команде /start', {chat_id: err.chatid, message_id: err.message})
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

async function notecreator(chatid){
    
    let mess = await bot.sendMessage(chatid, 'Введи название события', replyBack)
    createChatDB(chatid, mess.message_id)
    let note = {date: 0, hour: 0, min: 0, eventName: 0, chatid: chatid, message: 0}
    let eventName = new Promise((resolve, reject) => {
        async function giveName (msg) {
            if ((msg.text !== '/start' && msg.chat.id === chatid) && (msg.text !== 'Назад' && msg.chat.id === chatid)) {
                note.eventName = msg.text
                bot.removeListener('message', giveName)
                resolve(note)
                
            } else if ((msg.text === '/start' && msg.chat.id === chatid) || (msg.text === 'Назад' && msg.chat.id === chatid)) {
                bot.removeListener('message', giveName)
                reject({chatid: chatid, message:  mess.message_id, text: msg.text})
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
                let btn = {reply_markup: JSON.stringify(
                monthBuilder(month, year)
                )} 
            let mess = await bot.sendMessage(chatid, 'Укажи дату:', btn)
            note.message = mess.message_id
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
                                    [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
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
                                bot.editMessageText(`Напомню про "${note.eventName}" ${new Date(note.date).format('d.M.Y')} в ${note.hour}:${note.min}`, {chat_id:note.chatid,message_id:note.message})
                                let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
                                let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
                                date = new Date(date).setHours(new Date(date).getHours()-user.timediff)
                                console.log(note.hour);
                                await notesModel.create({
                                    chatid: note.chatid,
                                    notedate: `${new Date(date).format(`Y-M-d H:m`)}`,
                                    notename: note.eventName,
                                    everyday: false
                                }).catch(err=>{
                                    usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                        console.log("Error - " + err);
                                        for (i=0; i<res.length; i++){
                                            bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                            bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз.")
                                        }
                                    })
                                })
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
                        bot.removeListener('callback_query', dateBuilder)
                        reject({chatid:chatid,message:mess.message_id})
                    }
                }
                bot.on('callback_query', dateBuilder)
            }).then(async note=>{
                let mess = await bot.sendMessage(note.chatid, 'Мы вернулись в главное меню', mainmenu)
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
            let mess = await bot.sendMessage(err.chatid, 'Ты вернулся в главное меню', mainmenu)
            createChatDB(err.chatid, mess.message_id)
            console.log(mess);
        }
    })


}

async function noteEdCreator(chatid) {
    let mess = await bot.sendMessage(chatid, 'Введи название события', replyBack)
    createChatDB(chatid, mess.message_id)
    let note = { hour: 0, min: 0, eventName: 0, chatid: chatid, message: 0}
    note.date = new Date().format('Y-M-d')
    let eventName = new Promise((resolve, reject) => {
        async function giveName (msg) {
            if ((msg.text !== '/start' && msg.chat.id === chatid) && (msg.text !== 'Назад' && msg.chat.id === chatid)) {
                note.eventName = msg.text
                bot.removeListener('message', giveName)
                resolve(note)
                
            } else if ((msg.text === '/start' && msg.chat.id === chatid) || (msg.text === 'Назад' && msg.chat.id === chatid)) {
                bot.removeListener('message', giveName)
                reject({chatid: chatid, message:  mess.message_id, text: msg.text})
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
                    let btn = []
                    for (i=0; i<getHour.length; i++){
                        btn.push(getHourfored[i])
                    }
                    btn = {reply_markup: JSON.stringify({
                        inline_keyboard: btn
                    })} 
                    resolve({note: note, btn: btn})
                }
                if (msg.data == 'start') {
                    bot.removeListener('callback_query', nameConfirm)
                    chatModel.destroy({where:{messageid: mess.message_id}})
                    reject({chatid: note.chatid, message: mess.message_id})
                }
            }
            bot.on('callback_query', nameConfirm)
        }).then(async res=>{
            let note = res.note
            let btn = res.btn
            deleteBotMessage(note.chatid)
            let mess = await bot.sendMessage(note.chatid, 'Укажи время:', btn)
            note.message = mess.message_id
            let eventDate = new Promise ( async(resolve,reject)=>{
                async function dateBuilder(msg) {
                    if(msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data !== 'myEdNote' && msg.data !== 'myinfo' ) {
                        if (note.hour === 0) {
                            note.hour = msg.data
                                let newBtn = [
                                    [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                                    {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                                    [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                                    {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                                    [{text: 'Назад', callback_data:'start'}]
                                ]
                                btn = {
                                    inline_keyboard: newBtn
                                }
                                bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                        } else if (note.min === 0) {
                            if (msg.data !== "minback" && msg.data !== 'minnext' && msg.data !== 'back') {
                                note.min = msg.data
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
                                bot.editMessageText(`Напомню про "${note.eventName}" в ${note.hour}:${note.min}.`, {chat_id:note.chatid,message_id:note.message})
                                let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
                                let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
                                date = new Date(date).setHours(new Date(date).getHours()-user.timediff)
                                await notesModel.create({
                                    chatid: note.chatid,
                                    notedate: `${new Date(date).format(`Y-M-d H:m`)}`,
                                    notename: note.eventName,
                                    everyday: true
                                }).catch(err=>{
                                    usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                        console.log("Error - " + err);
                                        for (i=0; i<res.length; i++){
                                            bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                            bot.sendMessage(note.chatid, "Произошла ошибка, уведомление не создано, попробуй еще раз.")
                                        }
                                    })
                                })
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
                                let newBtn = []
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
                        bot.removeListener('callback_query', dateBuilder)
                        reject({chatid:chatid,message:mess.message_id})
                    }
                }
                bot.on('callback_query', dateBuilder)
            }).then(async note=>{
                let mess = await bot.sendMessage(note.chatid, 'Мы вернулись в главное меню.', mainmenu)
                createChatDB(note.chatid, mess.message_id)
            }).catch(err=>{
                bot.editMessageText('Ты вернулся в главное меню', {chat_id: err.chatid, message_id:err.message})
            })
        }).catch(err=>{
            bot.editMessageText('Ты вернулся в главное меню', {chat_id: err.chatid, message_id:err.message})
        })

    }).catch(err=>{
        if (err.text !== 'Назад') {
            chatModel.destroy({where:{messageid: err.message}})
            bot.editMessageText('Команда не может быть названием', {chat_id: err.chatid, message_id: err.message})
        } else {
            bot.sendMessage(err.chatid, 'Ты вернулся в главное меню', mainmenu)
        }
    })
}

async function editNotesdate (note) {
    let year = Number(new Date().format('Y'))
    let month = Number(new Date().format('M'))
    let btn
    if (note.everyday == 1) {
        let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        newBtn.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
    } else {
        btn = monthBuilder(month, year)
    }
    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.mess})
    async function dateBuilder(msg) {
        let chatid = note.chatid
        let mess = note.mess
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
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === 'backmonth') {
                    if(month == 1) {
                        month = 12
                        year--
                    } else {
                        month--
                    }
                    btn = monthBuilder(month, year)
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === 'nextmonth') {
                    if (month == 12) {
                        month = 1
                        year++ 
                    } else {
                        month ++
                    }
                    btn = monthBuilder(month, year)
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
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
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
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
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
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
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === 'back') {
                    
                    if (note.everyday == 1) {
                        bot.removeListener('callback_query', dateBuilder)
                        bot.deleteMessage(chatid, mess)
                        let message = await bot.sendMessage(chatid, 'Ты вернулся в главное меню', mainmenu)
                        createChatDB(chatid, message.message_id)
                    } else {
                        note.date = 0
                        let year = Number(new Date().format('Y'))
                        let month = Number(new Date().format('M'))
                        btn = monthBuilder(month, year)
                        bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                    }
                }
            } else if (note.min === 0) {
                if (msg.data !== "minback" && msg.data !== 'minnext' && msg.data !== 'back') {
                    await bot.removeListener('callback_query', dateBuilder)
                    note.min = msg.data
                    console.log(note);
                    if (note.everyday === 1){
                        let noteDate = new Date (note.date)
                        noteDate = new Date (noteDate).setHours(note.hour)
                        noteDate = new Date (noteDate).setMinutes(note.min)
                        noteDate = new Date (noteDate).getTime()
                        let dateNow = new Date ().getTime()
                        if (noteDate < dateNow) {
                            noteDate = new Date (noteDate).setDate(new Date (noteDate).getDate()+1)
                            note.date = new Date (noteDate).format('Y-M-d')
                        }
                    }
                    bot.deleteMessage(chatid, note.mess)
                    await bot.sendMessage(note.chatid, `Напомню ${new Date(note.date).format('d.M.Y')} в ${note.hour}:${note.min}`)
                    let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
                    let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
                    date = new Date(date).setHours(new Date(date).getHours()-user.timediff)
                    await notesModel.update({notedate: `${new Date(date).format(`Y-M-d H:m`)}`}, {where:{id: note.id}}).catch(err=>{
                        usersModel.findAll({where:{isadmin: true}}).then(res=>{
                            console.log("Error - " + err);
                            for (i=0; i<res.length; i++){
                                bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                bot.sendMessage(note.chatid, "Произошла ошибка, попробуйте еще раз.")
                            }
                        })
                    })
                    let mess = await bot.sendMessage(chatid, 'Мы вернулись в главное меню.', mainmenu)
                    createChatDB(chatid, mess.message_id)
                    note = 0
                    
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
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
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
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === "back") {
                    note.hour = 0
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        newBtn.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                }
            }
        } else if (msg.data === 'start') {
            bot.removeListener('callback_query', dateBuilder)
            bot.deleteMessage(chatid, mess)
        }
    }
    bot.on('callback_query', dateBuilder)
}

async function selectNotes (chatid) {
    deleteBotMessage(chatid)
    notesModel.findAll({where:{chatid:chatid}, raw:true}).then(async res=>{
        if (res.length>0) {
            async function listener(msg) {
                if(msg.message.chat.id === res[0].chatid && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data.indexOf('del-')!== -1 ){
                    let index = 0
                    for (i=0;i<res.length;i++){
                        if (msg.data.slice(4) == res[i].id) {
                            index = i
                            break
                        }
                    }
                    chatModel.destroy({where:{messageid: msg.message.message_id}})
                    bot.editMessageText(`Уведомление "${res[index].notename}" было удалено`, {chat_id: res[0].chatid, message_id: msg.message.message_id})
                    notesModel.destroy({where:{id: msg.data.slice(4)}})
                }
                if(msg.message.chat.id === res[0].chatid && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data.indexOf('ed-')!== -1 ){
                    let index = 0
                    for (i=0;i<res.length;i++){
                        if (msg.data.slice(3) == res[i].id) {
                            index = i
                            break
                        }
                    }
                    await chatModel.destroy({where:{messageid: msg.message.message_id}})
                    await chatModel.findAll({where:{chatid:chatid}}).then(res=>{
                        if (res.length > 0) {
                           for(i=0;i<res.length;i++){
                            bot.deleteMessage(res[i].chatid,res[i].messageid)
                            chatModel.destroy({where:{messageid: res[i].messageid}})
                           }
                        }
                    })
                    let mess = msg.message.message_id
                    bot.removeListener('callback_query', listener)
                    async function notered(msg){
                        if (res[index].chatid === msg.message.chat.id && msg.data === 'redtime'){
                            bot.removeListener('callback_query', notered)
                            if(res[index].everyday == 1){
                                let note = {
                                    id: res[index].id,
                                    everyday: res[index].everyday,
                                    mess: mess,
                                    chatid: res[index].chatid,
                                    date: new Date (res[index].notedate).format('Y-M-d'),
                                    hour: 0,
                                    min: 0
                                }
                                editNotesdate(note)
                            } else {
                                let note = {
                                    id: res[index].id,
                                    everyday: res[index].everyday,
                                    mess: mess,
                                    chatid: res[index].chatid,
                                    date: 0,
                                    hour: 0,
                                    min: 0
                                }
                                editNotesdate(note)
                            }
                        }
                        if (res[index].chatid === msg.message.chat.id && msg.data === 'redname'){
                            bot.removeListener('callback_query', notered)
                            bot.editMessageText('Введи новое название', {chat_id: res[index].chatid, message_id:mess})
                            async function redName (msg) {
                                if (res[index].chatid === msg.chat.id && msg.text !== '/start') {
                                    notesModel.update({notename:msg.text}, {where:{id:res[index].id}})
                                    bot.deleteMessage(res[index].chatid, mess)
                                    let message = await bot.sendMessage(res[index].chatid, `Название было изменено на "${msg.text}"`, back)
                                    bot.removeListener('message', redName)
                                    async function delmess (msg) {
                                        if (msg.data = 'starbackt' && msg.message.chat.id === res[index].chatid) {
                                            bot.deleteMessage(msg.message.chat.id, message.message_id)
                                            bot.removeListener('callback_query', delmess)
                                        }
                                    }
                                    bot.on('callback_query', delmess)
                                } else if (res[index].chatid === msg.chat.id && msg.text === '/start') {
                                    bot.deleteMessage(res[index].chatid, mess)
                                    bot.removeListener('message', redName)
                                }
                            }
                            bot.on('message', redName)
                        }
                        if (res[index].chatid === msg.message.chat.id && msg.data === 'start'){
                            bot.deleteMessage(res[index].chatid, mess)
                            bot.removeListener('callback_query', notered)
                        }
                    }
                    bot.on('callback_query', notered)
                    bot.editMessageReplyMarkup(eventRedBtn, {chat_id: res[index].chatid, message_id: mess})
                }
                if(msg.message.chat.id === res[0].chatid && (msg.data === 'start' || msg.data === 'noteAdd' || msg.data === 'myNote' || msg.data === 'myinfo' || msg.data === 'myEdNote')) {
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
            let user = await usersModel.findOne({where:{id: res[0].chatid}, raw:true})
            for(i=0;i<res.length;i++) {
                let delBtn = {
                    reply_markup: JSON.stringify( {
                        inline_keyboard: [
                            [{text: 'Удалить', callback_data: `del-${res[i].id}`}, {text: 'Редактировать', callback_data: `ed-${res[i].id}`}],
                        ]
                    })
                }
                let date = new Date(res[i].notedate)
                date = date.setHours(date.getHours()+user.timediff)
                if (res[i].everyday == 1) {
                    let mess = await bot.sendMessage(res[i].chatid, `Ежедневное уведомление "${res[i].notename}" - ${new Date(date).format('h:m')}`, delBtn) 
                    createChatDB(res[i].chatid, mess.message_id)
                } else {
                    let mess = await bot.sendMessage(res[i].chatid, `Уведомление "${res[i].notename}" - ${new Date(date).format('d.M.Y h:m')}`, delBtn) 
                    createChatDB(res[i].chatid, mess.message_id)
                }
            }
            let mess = await bot.sendMessage(res[0].chatid, 'Это были все уведомления', back)
            createChatDB(res[0].chatid, mess.message_id)

        } else {
            let mess = await bot.sendMessage(chatid, 'Уведомлений нет', back)
            createChatDB(chatid, mess.message_id)
        }
    })
}

async function editTimediff (chatid) {
    let note = {date: 0, hour:0, chatid:chatid}
    let btnDateBack = new Date ().setDate(new Date().getDate()-1)
    let btnDateNext = new Date ().setDate(new Date().getDate()+1)
    let btn = {
        reply_markup: JSON.stringify( {
            inline_keyboard: [
                [{text: `${new Date (btnDateBack).format('d.M.Y')}`, callback_data: `${new Date (btnDateBack).format('Y-M-d')}`},
                {text: `${new Date ().format('d.M.Y')}`, callback_data: `${new Date ().format('Y-M-d')}`},
                {text: `${new Date (btnDateNext).format('d.M.Y')}`, callback_data: `${new Date (btnDateNext).format('Y-M-d')}`}
                ],
            ]
        })
    } 
    let mess = await bot.sendMessage(chatid, 'Хочу изменить твой часовой пояс. Укажи дату', btn)
    let regDate = new Promise ( (resolve, reject)=>{
        async function changedate (msg) {
            if(msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data !== 'myEdNote' && msg.data !== 'myinfo') {
                if (note.date === 0) {
                    if (msg.data !== 'backmonth' && msg.data !== 'nextmonth' ) {
                        note.date = msg.data
                        let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                        for (i=0; i<getTime.length; i++){
                            newBtn.push(getTime[i])
                        }
                        btn = {
                            inline_keyboard: newBtn
                        }
                        await bot.editMessageText('Хочу изменить твой часовой пояс. Который час?',{chat_id: chatid, message_id: mess.message_id})
                        await bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
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
                        let usersData = await usersModel.findOne({where: {id:chatid}, raw:true})
                        let userDate = new Date(`${note.date} ${note.hour}:00`).getTime()
                        let serverDate = new Date().getTime()
                        serverDate = new Date(serverDate).setMinutes(00)
                        serverDate = new Date(serverDate).setSeconds(00)
                        serverDate = new Date(serverDate).setMilliseconds(0)
                        let datediff = (userDate - serverDate)/60/60/1000

                        usersData.timediff = datediff - usersData.timediff
                        await usersModel.update({timediff: datediff}, {where:{id: chatid}})
                        let notesArr = await notesModel.findAll({where:{chatid: chatid}, raw:true})
                        for (i=0; i<notesArr.length; i++){
                            let notesDate = new Date (notesArr[i].notedate).setHours(new Date (notesArr[i].notedate).getHours()-usersData.timediff)
                            notesModel.update({notedate: new Date(notesDate).format('Y-M-d H:m:S')}, {where: {id: notesArr[i].id}})
                        }
                        bot.editMessageText('Спасибо, данные изменил', {chat_id: chatid, message_id:mess.message_id})
                        bot.removeListener('callback_query', changedate)
                        resolve(note.chatid)
                    } else if (msg.data === "hourback") {
                        const oneDay = 1000 * 60 * 60 * 24; 
                        note.date = new Date(note.date).getTime() - oneDay
                        note.date = new Date(note.date).format('Y-M-d')
                        let backday = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                        for (i=0; i<getTime.length; i++){
                            backday.push(getTime[i])
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
                        for (i=0; i<getTime.length; i++){
                            backday.push(getTime[i])
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
                } 
            } else if (msg.data === 'start') {
                bot.removeListener('callback_query', changedate)
                reject({chatid:chatid,message:mess.message_id})
            }
        }
        bot.on('callback_query', changedate)
    }).then(async res=>{
        let mess = await bot.sendMessage(res, 'Создадим напоминание?', mainmenu)
        createChatDB(res, mess.message_id)
    }).catch(err=>{
        bot.editMessageText('Возвращаемся в главное меню', {chat_id: err.chatid, message_id: err.message})
    })
}




module.exports.editTimediff = editTimediff
module.exports.noteEdCreator = noteEdCreator
module.exports.selectNotes =selectNotes
module.exports.regUser = regUser
module.exports.fuck = fuck
module.exports.notecreator = notecreator
module.exports.monthBuilder = monthBuilder
module.exports.sorrySend = sorrySend
module.exports.updateSend = updateSend
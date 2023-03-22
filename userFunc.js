const { confirm, getHour, getTime, back, replyBack, mainmenu, eventRedBtn } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel } = require("./bd");
const {monthBuilder} = require("./createFunc")

async function userHour(chatid, replace, name) {
    let note = {date: 0, hour:0, chatid:chatid, message: 0}
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
    if (replace == false) {
        let mess = await bot.sendMessage(chatid, 'Хочу определить твой часовой пояс. укажи дату', btn)
        note.message = mess.message_id 
    } else {
        let mess = await bot.sendMessage(chatid, 'Хочу изменить твой часовой пояс. укажи дату', btn)
        note.message = mess.message_id 
    }
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
                        await bot.editMessageText('Хочу определить твой часовой пояс. Который час?',{chat_id: note.chatid, message_id: note.message})
                        await bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
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
                        bot.removeListener('callback_query', regEvent)
                        note.hour = msg.data
                        let userDate = new Date(`${note.date} ${note.hour}:00`).getTime()
                        let serverDate = new Date().getTime()
                        serverDate = new Date(serverDate).setMinutes(00)
                        serverDate = new Date(serverDate).setSeconds(00)
                        serverDate = new Date(serverDate).setMilliseconds(0)
                        let datediff = (userDate - serverDate)/60/60/1000

                        if (replace == false) {
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
                            bot.editMessageText('Спасибо, я тебя запомнил, благодаря указанному времени я смогу отправлять тебе уведомления в твоем часовом поясе', {chat_id: note.chatid, message_id: note.message})
                        } else {
                            let usersData = await usersModel.findOne({where: {id:chatid}, raw:true})
                            usersData.timediff = datediff - usersData.timediff
                            await usersModel.update({timediff: datediff}, {where:{id: chatid}})
                            let notesArr = await notesModel.findAll({where:{chatid: chatid}, raw:true})
                            for (i=0; i<notesArr.length; i++){
                                let notesDate = new Date (notesArr[i].notedate).setHours(new Date (notesArr[i].notedate).getHours()-usersData.timediff)
                                notesModel.update({notedate: new Date(notesDate).format('Y-M-d H:m:S')}, {where: {id: notesArr[i].id}})
                            }
                            bot.editMessageText('Спасибо, данные изменил', {chat_id: note.chatid, message_id: note.message})
                        }
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
                        bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
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
                        bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                    } else if (msg.data === 'back') {
                        note.date = 0
                        let year = Number(new Date().format('Y'))
                        let month = Number(new Date().format('M'))
                        btn = monthBuilder(month, year)
                        bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
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

module.exports.userHour = userHour
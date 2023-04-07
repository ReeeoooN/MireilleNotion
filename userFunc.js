const { confirm, getHour, getTime, mainmenuBtnCreate, } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel, friendshipModel } = require("./bd");
const {monthBuilder} = require("./createFunc")

async function userHour(chatid, replace, name, username) {
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
                    note.date = msg.data
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getTime.length; i++){
                        newBtn.push(getTime[i])
                    }
                    newBtn.push([{text: `Назад`, callback_data: 'back' }])
                    btn = {
                        inline_keyboard: newBtn
                    }
                    await bot.editMessageText('Хочу определить твой часовой пояс. Который час?',{chat_id: note.chatid, message_id: note.message})
                    await bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})    
                } else if (note.hour === 0) {
                    if (msg.data !== 'back') {
                        bot.removeListener('callback_query', regEvent)
                        note.hour = msg.data
                        let userDate = new Date(`${note.date} ${note.hour}:00`).getTime()
                        let serverDate = new Date().getTime()
                        serverDate = new Date(serverDate).setMinutes(00)
                        serverDate = new Date(serverDate).setSeconds(00)
                        serverDate = new Date(serverDate).setMilliseconds(0)
                        let datediff = (userDate - serverDate)/60/60/1000

                        if (replace == false) {
                            await usersModel.create({
                                id: note.chatid,
                                timediff: datediff,
                                name: name,
                                username: username,
                                isadmin: false,
                                coop: false
                            }).catch(err=>{
                                usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                    console.log("Error - " + err);
                                    for (i=0; i<res.length; i++){
                                        bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                        
                                    }
                                    bot.sendMessage(note.chatid, "Произошла ошибка, попробуйте еще раз.")
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
                    } else if (msg.data === 'back') {
                        note.date = 0
                        let btn = {
                            inline_keyboard: [
                                [{text: `${new Date (btnDateBack).format('d.M.Y')}`, callback_data: `${new Date (btnDateBack).format('Y-M-d')}`},
                                {text: `${new Date ().format('d.M.Y')}`, callback_data: `${new Date ().format('Y-M-d')}`},
                                {text: `${new Date (btnDateNext).format('d.M.Y')}`, callback_data: `${new Date (btnDateNext).format('Y-M-d')}`}
                                ],
                            ]
                        } 
                        if (replace == false) {
                            await bot.editMessageText('Хочу определить твой часовой пояс. укажи дату',{chat_id: note.chatid, message_id: note.message})
                            await bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                        } else {
                            await bot.editMessageText('Хочу изменить твой часовой пояс. укажи дату',{chat_id: note.chatid, message_id: note.message})
                            await bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.message})
                        }
                    }
                } 
            } else if (msg.data === 'start') {
                bot.removeListener('callback_query', regEvent)
                reject({chatid:chatid,message:note.message})
            }
        }
        bot.on('callback_query', regEvent)
    }).then(async res=>{
        let mess = await bot.sendMessage(res, 'Создадим уведомление?', await mainmenuBtnCreate(res))
        createChatDB(res, mess.message_id)
    }).catch(err=>{
        bot.editMessageText('Без указания даты я не смогу отправлять уведомления в твоем часовом поясе. Ты можешь попробовать еще раз по команде /start', {chat_id: err.chatid, message_id: err.message})
    })
}

async function NameChanger(chatid){
    usersModel.findOne({where:{id:chatid}}).then(async user=>{
        let prom = new Promise (async(resolve, reject)=>{
            async function confirmFunc (msg) {
                
                if (msg.message.chat.id == chatid){
                    if (msg.data == 'confirmanswer') {
                        bot.removeListener('callback_query', confirmFunc)
                        resolve(msg.message.message_id)
                    }
                } else {
                    bot.removeListener('callback_query', confirmFunc)
                    reject(msg.message.message_id)
                }
            }
            bot.on('callback_query', confirmFunc)
            let mess = await bot.sendMessage(chatid, `Текущее имя ${user.name}, хочешь поменять?`, confirm)
        }).then(async message=>{
            async function newName(msg) {
                if (msg.chat.id == chatid) {
                    bot.removeListener('message', newName)
                    usersModel.update({name:msg.text}, {where:{id:chatid}})
                    bot.sendMessage(chatid, `${msg.text}, я запомнил`, await mainmenuBtnCreate(chatid))
                }
            }
            bot.on('message', newName)
            bot.editMessageText('Как к тебе обращаться?', {chat_id: chatid, message_id: message})
        }).catch(message=>{
            bot.editMessageText('Вернулись в главное меню', {chat_id: chatid, message_id: message})
        })
        
    })
}

module.exports.userHour = userHour
module.exports.NameChanger = NameChanger
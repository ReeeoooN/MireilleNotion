const { getHour, getTime, back, replyBack, eventRedBtn, mainmenuBtnCreate, friendBtn } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel, friendshipModel } = require("./bd");
const {monthBuilder} = require("./createFunc")

async function userShowFriend(chatid) {
    let friends = await friendshipModel.findAll({where:{chatid:chatid}, raw:true})
    let coopirations = await friendshipModel.findAll({where:{friendid:chatid}, raw:true})
    let friendlist
    if (friends.length !== 0) {
        friendlist = 'Ты можешь отправлять уведомления: \n'
        for (let index = 0; index < friends.length; index++) {
            if (friends[index].confirm == true) {
                friendlist = friendlist + `${index+1}. ${friends[index].friendname}\n`
            } else {
                friendlist = friendlist + `${index+1}. ${friends[index].friendname} (Не подтвердил заявку)\n`
            }
        }
    } else {
        friendlist = 'Пока ты никому не можешь отправить уведомления, но ты можешь пополнить список по кнопке "Добавить друга". \n\n'
    }
    if (coopirations.length !== 0) {
        friendlist = friendlist + 'Тебе могут отправить уведомления: \n'
        for (let index = 0; index < coopirations.length; index++) {
            if (coopirations[index].confirm == true) {
                friendlist = friendlist + `${index+1}. ${coopirations[index].name}\n`
            } else {
                friendlist = friendlist + `${index+1}. ${coopirations[index].name} (Не подтверждена заявка)\n`
            }
        }
    } else {
        friendlist = friendlist + 'Пока тебе никто не может отправить уведомления, ты можешь сообщить свой ID другу.'
    }
    bot.sendMessage(chatid, friendlist, await friendBtn(chatid))
}

async function userAddFriend (chatid, name) {
    let mess = await bot.sendMessage(chatid, 'Введи ID своего друга', replyBack)
    createChatDB(chatid, mess.message_id)
    async function idViewer (msg) {
        if (msg.chat.id === chatid) {
            if (msg.text != "Назад") {
                bot.removeListener("message", idViewer)
                usersModel.findOne({where:{id:msg.text}, raw:true}).then(async res=>{
                    if (!res || res.coop == false) {
                        deleteBotMessage(chatid)
                        let mess = await bot.sendMessage(chatid, 'Такого пользователя нет, либо отключен совместный режим', await mainmenuBtnCreate(chatid))
                        createChatDB(chatid, mess.message_id)
                    } else if (msg.text == chatid) {
                        bot.sendMessage(chatid, 'Cебя добавляешь, да? Меня не проведешь...', back)
                    } else {
                        let userFriendCheck = await friendshipModel.findOne({where:{chatid: chatid, friendid: msg.text}, raw:true})
                        if (!userFriendCheck) {
                            friendshipModel.create({
                                chatid: chatid,
                                name: name,
                                friendid: msg.text,
                                friendname: res.name,
                                confirm: false
                            }).then(res=>{
                                friendshipModel.findOne({where:{chatid: chatid, friendid: msg.text}, raw:true}).then(async res=>{
                                    
                                    bot.sendMessage(chatid, 'Запрос был отправлен', back)
                                    let falseInvite = {inviteFriend: res.id, confirm: false}
                                    falseInvite = JSON.stringify(falseInvite)
                                    let trueInvite = {inviteFriend: res.id, confirm: true}
                                    trueInvite = JSON.stringify(trueInvite)
                                    let invite = {
                                        reply_markup: JSON.stringify( {
                                            inline_keyboard: [
                                                [{text: 'Принять', callback_data: trueInvite}, {text: 'Отклонить', callback_data: falseInvite}],
                                            ]
                                        })
                                    } 
                                    
                                    bot.sendMessage(msg.text, `${res.name} хочет отправлять тебе уведомления`, invite)
                                })
                            })
                        } else {
                            if (userFriendCheck.confirm == true) {
                                bot.sendMessage(chatid, 'Друг уже есть в списке', back)
                            } else {
                                bot.sendMessage(chatid, 'Запрос уже был отправлен, его необходимо принять', back)
                            }
                        }
                    } 
                })
            } else {
                deleteBotMessage(chatid)
                let mess = await bot.sendMessage(chatid, 'Вернулись в главное меню', await mainmenuBtnCreate(chatid))
                createChatDB(chatid, mess.message_id)
                bot.removeListener("message", idViewer)
            }       
        }
    }
    bot.on('message', idViewer)
}

async function confirmInvite(obj, message, chatid) {
    friendshipModel.findOne({where:{id:obj.inviteFriend}}).then(res=>{
        if (obj.confirm == true) {
            friendshipModel.update({confirm:true}, {where:{id:obj.inviteFriend}})
            bot.sendMessage(res.chatid, `Приглашение было принято ${res.friendname}`)
            bot.deleteMessage(chatid, message)
        } else {
            bot.sendMessage(res.chatid, `Приглашение было отклонено ${res.friendname}`)
            bot.deleteMessage(chatid, message)
            friendshipModel.destroy({where:{id:res.id}})
        }
    })    
}

async function coopDeleteFr (chatid, who) {
    
    let mess = await bot.sendMessage(chatid, 'Кого удалим?')
    async function deleter (msg) {
        if (msg.message.chat.id == chatid && msg.data != 'start') {
            if (who == 'friend') {
                friendshipModel.destroy({where:{friendid:msg.data, chatid:chatid}})
            } else {
                friendshipModel.destroy({where:{chatid:msg.data, friendid: chatid}})
            }
            await bot.editMessageReplyMarkup(await delBtnCreator(who, chatid), {chat_id: chatid, message_id: mess.message_id})
        } else if (msg.message.chat.id == chatid && msg.data == 'start') {
            bot.removeListener('callback_query', deleter)
            bot.deleteMessage(chatid, mess.message_id)
        }
    }
    bot.editMessageReplyMarkup(await delBtnCreator(who, chatid), {chat_id: chatid, message_id: mess.message_id})
    bot.on('callback_query', deleter)
}

async function delBtnCreator(who, chatid) {
    if (who == 'friend'){
        let res = await friendshipModel.findAll({where:{chatid:chatid}})
        btn = []
            for (let index = 0; index < res.length; index++) {
                btn.push([{text: `${index+1}. ${res[index].friendname}`, callback_data: res[index].friendid}])          
            }
            btn.push([{text: 'Назад', callback_data: 'start'}])
            btn = {
                inline_keyboard: btn
            }
            return btn
    } else if (who == 'subscriber') {
        let res = await friendshipModel.findAll({where:{friendid:chatid}})
        btn = []
            for (let index = 0; index < res.length; index++) {
                btn.push([{text: `${index+1}. ${res[index].name}`, callback_data: res[index].chatid}])          
            }
            btn.push([{text: 'Назад', callback_data: 'start'}])
            btn = {
                inline_keyboard: btn
            }
            return btn 
    }
}

module.exports.confirmInvite = confirmInvite
module.exports.userAddFriend = userAddFriend
module.exports.userShowFriend = userShowFriend
module.exports.coopDeleteFr =coopDeleteFr
module.exports.delBtnCreator =delBtnCreator
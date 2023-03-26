const { confirm, getHour, getTime, back, replyBack, eventRedBtn, mainmenuBtnCreate, friendBtn } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel, friendshipModel } = require("./bd");
const {monthBuilder} = require("./createFunc")

async function userShowFriend(chatid) {
    friendshipModel.findAll({where:{chatid:chatid}, raw:true}).then(async res=>{
        let friendlist = "";
        for (let index = 0; index < res.length; index++) {
            friendlist = friendlist + `${index+1}. ${res[index].friendname}\n`
        }
        let mess = await bot.sendMessage(chatid, `Список друзей: \n ${friendlist}`, friendBtn)
        createChatDB(chatid, mess.message_id)
    })
}

async function userAddFriend (chatid) {
    let mess = await bot.sendMessage(chatid, 'Введи ID своего друга', replyBack)
    createChatDB(chatid, mess.message_id)
    async function idViewer (msg) {
        if (msg.chat.id === chatid) {
            if (msg.text != "Назад") {
                usersModel.findOne({where:{id:msg.text}, raw:true}).then(async res=>{
                    console.log(res);
                    if (!res || res.coop == false) {
                        deleteBotMessage(chatid)
                        let mess = await bot.sendMessage(chatid, 'Такого пользователя нет, либо отключен совместный режим', await mainmenuBtnCreate(chatid))
                        createChatDB(chatid, mess.message_id)
                        bot.removeListener("message", idViewer)
                    } else {
                        friendshipModel.create({
                            chatid: chatid,
                            friendid: msg.text,
                            friendname: res.name
                        }).then(async res=>{
                            console.log( res);
                            let mess = await bot.sendMessage(chatid, 'Друг был добавлен', await mainmenuBtnCreate(chatid))
                            createChatDB(chatid, mess.message_id)
                        }).catch(err=>{
                            usersModel.findAll({where:{isadmin: true}}).then(res=>{
                                console.log("Error - " + err);
                                for (i=0; i<res.length; i++){
                                    bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                }
                                bot.sendMessage(chatid, "Произошла ошибка, друг не добавлен, попробуй позже.")
                            })
                        })
                        
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


module.exports.userAddFriend = userAddFriend
module.exports.userShowFriend = userShowFriend
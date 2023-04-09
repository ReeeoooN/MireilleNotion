const { infoMenuBtnCreate, adminbtn, mainmenuBtnCreate, back, coopNote, repeatBtn } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { selectNotes,} = require('./editNoteFunc');
const {fuck, sorrySend, updateSend, phrase} = require("./adminFunc")
const { createChatDB, deleteBotMessage } = require("./messdel");
const { chatModel, usersModel, notesModel, friendshipModel, noterepeatModel } = require("./bd");
const { creator, preCreator } = require("./createFunc");
const { userHour, NameChanger } = require("./userFunc");
const { userAddFriend, userShowFriend, confirmInvite, coopDeleteFr } = require("./coopFunc")
const { phraseRand } = require("./dynamicAnswers");
const { notesSender, repeatSender } = require("./senderFunc");
const { stopRepeating } = require("./repeatFunc");

bot.setMyCommands( [
    {command: '/start', description: 'Начать'}
]) // Стандартные команды
bot.on('message', async msg=>{ 
    console.log(msg);
    if(msg.text === '/start') {
        chatModel.findAll({where:{chatid:msg.chat.id}}).then(res=>{
            for (i=0;i<res.length;i++){
                bot.deleteMessage(res[i].chatid, res[i].messageid)
            chatModel.destroy({
                where: {
                    chatid: res[i].chatid
                }
            })
            }
        })
        usersModel.findOne({where: {id:msg.chat.id}, raw:true}).then(async user=>{
            if(!user) {
                await bot.sendMessage(msg.chat.id, `Рады вас видеть в этой бренной вселенной, ${msg.from.first_name}`)
                userHour(msg.chat.id, false, msg.from.first_name, msg.from.username)
            } else {
                if (user.name == null) {
                    usersModel.update({name: msg.from.first_name}, {where: {id:msg.chat.id}})
                }
                if (user.username == null) {
                    usersModel.update({username: msg.from.username}, {where: {id:msg.chat.id}})
                }
                await bot.sendMessage(msg.chat.id, await phraseRand('salutation', msg.chat.id))
                let mess = await bot.sendMessage(msg.chat.id, `Создадим уведомление?`, await mainmenuBtnCreate(msg.chat.id))
                createChatDB(msg.chat.id, mess.message_id)
            }
        })
    }
})

bot.on('callback_query', async msg=>{
    let data = msg.data
    console.log(msg);
    usersModel.findOne({where: {id:msg.message.chat.id}}).then(async user=>{
        if(!user) {
            if (msg.data == 'noteAdd' || msg.data === 'myNote' || msg.data === 'myEdNote' || msg.data === 'myinfo' || msg.data === 'donate' || msg.data === 'timediffEdit' || msg.data == 'start') {
            await bot.sendMessage(msg.message.chat.id, `Рады вас видеть в этой бренной вселенной, ${msg.from.first_name}, что-то пошло не так, потребуется провести регистрацию повторно`)
            userHour(msg.chat.id, false, msg.message.chat.first_name, msg.message.chat.username)
            }
        } else {
            if (user.name == null) {
                usersModel.update({name: msg.message.chat.first_name}, {where: {id:msg.message.chat.id}})
            }
            if (user.username == null) {
                usersModel.update({username: msg.message.chat.username}, {where: {id:msg.message.chat.id}})
            }
            if (msg.data == 'noteAdd') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                preCreator({everyday: false, coop: false, chatid: msg.from.id})
            }
            if (msg.data === 'myNote') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                selectNotes(msg.message.chat.id)
            }
            if (msg.data === 'myEdNote') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                preCreator({everyday: true, coop: false, chatid: msg.from.id})
            }
            if (msg.data === 'coopNoteAdd') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                preCreator({everyday: false, coop: true, chatid: msg.from.id})
            }
            if (msg.data === 'coopEdNote') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                preCreator({everyday: true, coop: true, chatid: msg.from.id})
            }
            if (msg.data === 'coopNote'){
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                bot.sendMessage(msg.message.chat.id, 'Какое уведомление создадим другу?\n P.S. Уведомление создавай в своем часовом поясе, я все посчитаю сам:)',coopNote)
            }
            if (msg.data === 'myinfo') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                usersModel.findOne({where:{id:msg.message.chat.id}, raw:true}).then(async res=>{
                    if (res.coop == false) {
                        let mess = await bot.sendMessage(msg.message.chat.id, 'Дополнительные возможности:', await infoMenuBtnCreate(msg.message.chat.id))
                        createChatDB(msg.message.chat.id, mess.message_id)
                    } else {
                        let btn = await infoMenuBtnCreate(msg.message.chat.id)
                        btn = btn.reply_markup
                        let mess = await bot.sendMessage(msg.message.chat.id, `ID в совместном режиме <code>${res.id}</code> \n Дополнительные возможности:`, {reply_markup: btn, parse_mode: 'HTML'})
                        createChatDB(msg.message.chat.id, mess.message_id)
                    }
                })
            }
            if (msg.data === 'changeName') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                NameChanger(msg.message.chat.id)
            }
            if (msg.data === 'donate') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                await bot.sendMessage(msg.message.chat.id, 'Если возникло такое желание, то ты можешь отправить донат на <a href="qiwi.com/n/REEEOOON">киви</a>, спасибо!',{parse_mode: 'HTML'})
                let mess =  await bot.sendMessage(msg.message.chat.id, "Создадим уведомление?", await mainmenuBtnCreate(msg.message.chat.id))
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data === 'timediffEdit') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                userHour(msg.message.chat.id, true, msg.from.name)
            }
            if (msg.data == 'start') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                let mess = await bot.sendMessage(msg.message.chat.id, `С возвращением, ${msg.from.first_name}`, await mainmenuBtnCreate(msg.message.chat.id))
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == "adminmenu") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                let mess = await bot.sendMessage(msg.message.chat.id, "Welcome to the club", adminbtn)
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == "noterest") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                fuck(msg.message.chat.id)
            }
            if (msg.data == "sorrysend") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                sorrySend(msg.message.chat.id)
            }
            if (msg.data == "updatesend") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                updateSend(msg.message.chat.id)
            }
            if (msg.data == "salutationphraseadd") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                phrase(msg.message.chat.id, 'salutation')
            }
            if (msg.data == "sendnotetextadd") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                phrase(msg.message.chat.id, 'note')
            }
            if (msg.data == 'coopModeOn') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                await usersModel.update({coop:true}, {where: {id:msg.message.chat.id}})
                await bot.sendMessage(msg.message.chat.id, `Твой ID совместного режима <code>${msg.message.chat.id}</code>, он будет отображаться разделе "Дополнительно". Сообщи этот ID другу, чтобы он мог оставлять тебе уведомления.`, {parse_mode: 'HTML'})
                let mess = await bot.sendMessage(msg.message.chat.id, "Совместный режим был включен", await mainmenuBtnCreate(msg.message.chat.id))
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == 'coopModeOff') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                await usersModel.update({coop:false}, {where: {id:msg.message.chat.id}})
                let mess = await bot.sendMessage(msg.message.chat.id, "Совместный режим был выключен", await mainmenuBtnCreate(msg.message.chat.id))
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == 'repeatModeOn') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                await usersModel.update({repeaton:true}, {where: {id:msg.message.chat.id}})
                let mess = await bot.sendMessage(msg.message.chat.id, "Повтор уведомлений включен", await mainmenuBtnCreate(msg.message.chat.id))
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == 'repeatModeOff') {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                await usersModel.update({repeaton:false}, {where: {id:msg.message.chat.id}})
                let mess = await bot.sendMessage(msg.message.chat.id, "Повтор уведомлений выключен", await mainmenuBtnCreate(msg.message.chat.id))
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == "myFriends") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                userShowFriend(msg.message.chat.id)
            }
            if (msg.data == "coopAddFriend") {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                userAddFriend(msg.message.chat.id, msg.message.chat.first_name)
            }
            if (msg.data == "coopDelFriend") {
                bot.deleteMessage(msg.message.chat.id, msg.message.message_id)
                coopDeleteFr(msg.from.id, 'friend')
            }
            if (msg.data == "subscriberDel") {
                bot.deleteMessage(msg.message.chat.id, msg.message.message_id)
                coopDeleteFr(msg.from.id, 'subscriber')
            }
            if (data.indexOf('inviteFriend')!== -1) {
                bot.deleteMessage(msg.from.id, msg.message.message_id)
                let inviteObj = JSON.parse(msg.data)
                confirmInvite(inviteObj, msg.message.message_id, msg.from.id)           
            }
            if (data.indexOf('repeatBtn')!== -1) {
                let repeatObj = JSON.parse(msg.data)
                stopRepeating(msg.message.chat.id, repeatObj)           
            }
        }
    })
    
    
})


notesSender()
setInterval(notesSender, 60000)
repeatSender()
setInterval(repeatSender, 60000)
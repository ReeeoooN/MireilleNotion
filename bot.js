const { mainmenu, infoMenu, mainmenuadmin, adminbtn } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { selectNotes,} = require('./editNoteFunc');
const {fuck, sorrySend, updateSend} = require("./adminFunc")
const { createChatDB, deleteBotMessage } = require("./messdel");
const { chatModel, usersModel, notesModel } = require("./bd");
const { creator } = require("./createFunc");
const { userHour } = require("./userFunc");

bot.setMyCommands( [
    {command: '/start', description: 'Начать'}
]) // Стандартные команды
bot.on('message', async msg=>{ 
    console.log(toString(msg.text));
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
            console.log(user);
            if(!user) {
                await bot.sendMessage(msg.chat.id, `Рады вас видеть в этой бренной вселенной, ${msg.from.first_name}`)
                userHour(msg.chat.id, false, msg.from.name)
            } else {
                if (user.name == null) {
                    usersModel.update({name: msg.from.username}, {where: {id:msg.chat.id}})
                }
                if (user.isadmin == 0) {
                    let mess = await bot.sendMessage(msg.chat.id, 'Создадим уведомление?', mainmenu)
                    createChatDB(msg.chat.id, mess.message_id)
                } else {
                    let mess = await bot.sendMessage(msg.chat.id, 'Создадим уведомление?', mainmenuadmin)
                    createChatDB(msg.chat.id, mess.message_id)
                }
            }
        })
    }
})

bot.on('callback_query', async msg=>{
    usersModel.findOne({where: {id:msg.message.chat.id}}).then(async user=>{
        if(!user) {
            if (msg.data == 'noteAdd' || msg.data === 'myNote' || msg.data === 'myEdNote' || msg.data === 'myinfo' || msg.data === 'donate' || msg.data === 'timediffEdit' || msg.data == 'start') {
            await bot.sendMessage(msg.message.chat.id, `Рады вас видеть в этой бренной вселенной, ${msg.from.first_name}, что-то пошло не так, потребуется провести регистрацию повторно`)
            userHour(msg.chat.id, false, msg.from.name)
            }
        } else {
            if (user.name == null) {
                usersModel.update({name: msg.from.username}, {where: {id:msg.message.chat.id}})
            }
            if (msg.data == 'noteAdd') {
                deleteBotMessage(msg.message.chat.id)
                let note = {date: 0, hour: 0, min: 0, eventName: 0, chatid: msg.message.chat.id, message: 0, everyday: false}
                creator(note, msg.message.chat.id)
            }
            if (msg.data === 'myNote') {
                selectNotes(msg.message.chat.id)
            }
            if (msg.data === 'myEdNote') {
                deleteBotMessage(msg.message.chat.id)
                let note = {date: new Date ().format('Y-M-d'), hour: 0, min: 0, eventName: 0, chatid: msg.message.chat.id, message: 0, everyday: true}
                creator(note, msg.message.chat.id)
        
            }
            if (msg.data === 'myinfo') {
                deleteBotMessage(msg.message.chat.id)
                let mess = await bot.sendMessage(msg.message.chat.id, 'Дополнительные возможности:', infoMenu)
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data === 'donate') {
                deleteBotMessage(msg.message.chat.id)
                await bot.sendMessage(msg.message.chat.id, 'Если возникло такое желание, то ты можешь отправить донат на <a href="qiwi.com/n/REEEOOON">киви</a>, спасибо!',{parse_mode: 'HTML'})
                let mess =  await bot.sendMessage(msg.message.chat.id, "Создадим уведомление?", mainmenu)
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data === 'timediffEdit') {
                deleteBotMessage(msg.message.chat.id)
                userHour(msg.message.chat.id, true, msg.from.name)
            }
            if (msg.data == 'start') {
               await chatModel.findAll({where:{chatid:msg.message.chat.id}}).then(res=>{
                    if (res.length > 0) {
                       for(i=0;i<res.length;i++){
                        bot.deleteMessage(res[i].chatid,res[i].messageid)
                        chatModel.destroy({where:{messageid: res[i].messageid}})
                       }
                    }
                })
                let mess = await bot.sendMessage(msg.message.chat.id, `С возвращением, ${msg.from.first_name}`, mainmenu)
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == "adminmenu") {
                deleteBotMessage(msg.message.chat.id)
                let mess = await bot.sendMessage(msg.message.chat.id, "Welcome to the club", adminbtn)
                createChatDB(msg.message.chat.id, mess.message_id)
            }
            if (msg.data == "noterest") {
                deleteBotMessage(msg.message.chat.id)
                fuck(msg.message.chat.id)
            }
            if (msg.data == "sorrysend") {
                deleteBotMessage(msg.message.chat.id)
                sorrySend(msg.message.chat.id)
            }
            if (msg.data == "updatesend") {
                deleteBotMessage(msg.message.chat.id)
                updateSend(msg.message.chat.id)
            }
        }
    })
    
    
})

async function notesSender(){ 
    let serverTime = new Date ().setSeconds(00)
    if (new Date(serverTime).getMinutes()%5 == 0) {
        serverTime = new Date (serverTime).setMilliseconds(00)
    serverTime = new Date (serverTime).getTime()
    let notesArray = await notesModel.findAll({raw:true})
    for (i=0;i<notesArray.length;i++){
        let noteTime = new Date (notesArray[i].notedate).getTime()
        if (serverTime == noteTime) {
            bot.sendMessage(notesArray[i].chatid, `Я пришёл к тебе напомнить важную вещь! ${notesArray[i].notename}.`)
            if (notesArray[i].everyday == 1) {
                let notedate = new Date(notesArray[i].notedate)
                notedate.setDate(notedate.getDate()+1)
                notedate.setSeconds(00)
                notesModel.update({notedate: new Date(notedate).format('Y-M-d H:m')}, {where: {id:notesArray[i].id}})
            } else {
                notesModel.destroy({where:{id:notesArray[i].id}})
            }
        }
    }
    }
}
notesSender()
setInterval(notesSender, 60000)
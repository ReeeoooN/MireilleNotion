const { mainmenu, infoMenu, back } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { fuck, notecreator, regUser, selectNotes, noteEdCreator, editTimediff} = require('./function');
const { createChatDB, deleteBotMessage } = require("./messdel");
const { chatModel, usersModel, notesModel } = require("./bd");

bot.setMyCommands( [
    {command: '/start', description: 'Начать'}
]) // Стандартные команды
bot.on('message', async msg=>{ 
    if(msg.text === '/start') {
        chatModel.destroy({ // удаление всех записей сообщений из базы данных
            where: {
                chatid: msg.chat.id
            }
        }) 
        usersModel.findOne({where: {id:msg.chat.id}}).then(async user=>{
            if(!user) {
                await bot.sendMessage(msg.chat.id, `Рады вас видеть в этой бренной вселенной, ${msg.from.first_name}`)
                regUser(msg.chat.id)
            } else {
                let mess = await bot.sendMessage(msg.chat.id, 'Создадим напоминание?', mainmenu)
                createChatDB(msg.chat.id, mess.message_id)
            }
        })
    }
})

bot.on('callback_query', async msg=>{
    if (msg.data == 'noteAdd') {
        deleteBotMessage(msg.message.chat.id)
        notecreator(msg.message.chat.id)
    }
    if (msg.data === 'myNote') {
        selectNotes(msg.message.chat.id)
    }
    if (msg.data === 'myEdNote') {
        deleteBotMessage(msg.message.chat.id)
        noteEdCreator(msg.message.chat.id)

    }
    if (msg.data === 'myinfo') {
        deleteBotMessage(msg.message.chat.id)
        let mess = await bot.sendMessage(msg.message.chat.id, 'Дополнительные возможности:', infoMenu)
        createChatDB(msg.message.chat.id, mess.message_id)
    }
    if (msg.data === 'donate') {
        deleteBotMessage(msg.message.chat.id)
        let mess = await bot.sendMessage(msg.message.chat.id, 'Пока не за что', back)
        createChatDB(msg.message.chat.id, mess.message_id)
    }
    if (msg.data === 'timediffEdit') {
        deleteBotMessage(msg.message.chat.id)
        editTimediff(msg.message.chat.id)
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
    
})

async function notesSender(){ 
    let serverTime = new Date ().setSeconds(00)
    serverTime = new Date (serverTime).setMilliseconds(00)
    serverTime = new Date (serverTime).getTime()
    let notesArray = await notesModel.findAll({raw:true})
    for (i=0;i<notesArray.length;i++){
        let noteTime = new Date (notesArray[i].notedate).getTime()
        if (serverTime == noteTime) {
            bot.sendMessage(notesArray[i].chatid, `Йо, не забудь про "${notesArray[i].notename}"!`)
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
notesSender()
setInterval(notesSender, 300000)
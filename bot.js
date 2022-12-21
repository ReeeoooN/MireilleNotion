const { mainmenu, infoMenu, back } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { fuck, notecreator, regUser, selectNotes, noteEdCreator, editTimediff } = require('./function');
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

var notesArray = []

async function giveNotes() {
    let notes = await notesModel.findAll({raw:true})
    if (notes.length>0){
        let date = new Date()
        date = new Date(date).setHours(new Date(date).getHours()+1)
        console.log(new Date(date).format('Y-M-d H:m'));
        for (i=0; i>notes.length; i++){
            if (new Date(notes[i].notedate).getHours()>new Date(date).getHours()){
                
                notes.push(notes[i])
            }
            console.log(new Date(notes[i].notedate).getHours(), new Date(date).getHours());
        }
        console.log(notes);
    }
}
giveNotes()
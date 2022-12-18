const { mainmenu } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { fuck, notecreator, regUser, selectNotes } = require('./function');
const { createChatDB, deleteBotMessage } = require("./messdel");
const { chatModel, usersModel } = require("./bd");
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
    if (msg.data == 'start') {

        chatModel.findAll({where:{chatid:msg.message.chat.id}}).then(res=>{
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
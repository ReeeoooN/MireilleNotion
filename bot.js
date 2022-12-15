const { mainmenu } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { fuck, notecreator, monthBuilder } = require('./function');
const { createChatDB, deleteBotMessage } = require("./messdel");
const { chatModel } = require("./bd");
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
        let mess = await bot.sendMessage(msg.chat.id, `Рады вас видеть в этой бренной вселенной, ${msg.from.first_name}`, mainmenu)
        createChatDB(msg.chat.id, mess.message_id)
    }
})

bot.on('callback_query', async msg=>{
    if (msg.data == 'noteAdd') {
        deleteBotMessage(msg.message.chat.id)
        notecreator(msg.message.chat.id)
    }
    if (msg.data == 'start') {
        deleteBotMessage(msg.message.chat.id)
        let mess = await bot.sendMessage(msg.message.chat.id, `С возвращением, ${msg.from.first_name}`, mainmenu)
        createChatDB(msg.message.chat.id, mess.message_id)
    }
})
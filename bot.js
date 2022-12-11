const { mainmenu } = require("./botBtn");
const { bot } = require("./TelegramAPI");
const { fuck, notecreator } = require('./function');
const { createChatDB, deleteBotMessage } = require("./messdel");
const { chatModel } = require("./bd");

bot.on('message', async msg=>{
    if(msg.text === '/start') {
        chatModel.destroy({ // удаление всех записей сообщений из базы данных
            where: {
                id: msg.chat.id
            }
        }) 
        let mess = await bot.sendMessage(msg.chat.id, `Привет, ${msg.from.first_name}`, mainmenu)
        createChatDB(msg.chat.id, mess.message_id)
    }
})

bot.on('callback_query', async msg=>{
    if (msg.data == 'noteAdd') {
        deleteBotMessage(msg.message.chat.id)
        notecreator(msg.message.chat.id)
    }
})
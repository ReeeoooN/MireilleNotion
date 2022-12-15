const { chatModel } = require("./bd");
const { bot } = require("./TelegramAPI");
function deleteBotMessage (chatid) {
        chatModel.findOne({where: {chatid: `${chatid}`}, raw: true})
        .then(user=>{
            if(!user) {
                return
            }
            bot.deleteMessage(user.chatid, user.messageid)
            chatModel.destroy({
                where: {
                    chatid: chatid
                }
            })
        }).catch(err=>console.log(err));
} // Удаляет предыдущее сообщение

function createChatDB(chatid, messid) {
   try {
    chatModel.create({
        chatid: chatid,
        messageid: messid
    })
   } catch(err) {

   }
} // Создает запись с сообщением для удаления

module.exports.deleteBotMessage = deleteBotMessage
module.exports.createChatDB = createChatDB
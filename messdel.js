const { chatModel } = require("./bd");
const { bot } = require("./TelegramAPI");
function deleteBotMessage (chatid) {
        chatModel.findOne({where: {id: `${chatid}`}, raw: true})
        .then(user=>{
            if(!user) {
                return
            }
            bot.deleteMessage(user.id, user.messageid)
            chatModel.destroy({
                where: {
                    id: chatid
                }
            })
        }).catch(err=>console.log(err));
} // Удаляет предыдущее сообщение

function createChatDB(chatid, messid) {
   try {
    chatModel.create({
        id: chatid,
        messageid: messid
    })
   } catch(err) {

   }
} // Создает запись с сообщением для удаления

module.exports.deleteBotMessage = deleteBotMessage
module.exports.createChatDB = createChatDB
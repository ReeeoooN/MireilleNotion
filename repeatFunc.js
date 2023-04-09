const { bot } = require("./TelegramAPI");
const { noterepeatModel } = require("./bd");

function stopRepeating (chatid, repeatObj) {
    noterepeatModel.findOne({where:{noteid:repeatObj.repeatBtn}, raw: true}).then(res=>{
        bot.editMessageReplyMarkup('', {chat_id: chatid, message_id: res.messageid})
        noterepeatModel.destroy({where:{id:res.id}})
    })
}

module.exports.stopRepeating = stopRepeating
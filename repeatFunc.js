const { bot } = require("./TelegramAPI");
const { noterepeatModel } = require("./bd");
const { logAdd } = require("./logFunc");

function stopRepeating (chatid, repeatObj) {
    bot.editMessageReplyMarkup('', {chat_id: chatid, message_id: repeatObj.mess})
    noterepeatModel.destroy({where:{noteid:repeatObj.repeatBtn}})
    logAdd(`Repeat stop ${JSON.stringify(repeatObj)}`)
}

module.exports.stopRepeating = stopRepeating
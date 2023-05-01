const { taskBot } = require("./TelegramAPI");
const { taskBtn } = require("./botBtn");
const { preCreator } = require("./createFunc");

async function addTask (chatid, userid, text) {
    note = {id:null, chatid: userid, message:0, coop: false, coopid: null, type: 'simple', period:null, stade: 'giveDate', date: null, hour: null, min: null, eventName: text}
    preCreator(note)
}

module.exports.addTask = addTask
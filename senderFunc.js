const { bot } = require("./TelegramAPI");
const { usersModel, notesModel, noterepeatModel } = require("./bd");
const { phraseRand } = require("./dynamicAnswers");

async function notesSender(){ 
    let serverTime = new Date ().setSeconds(00)
    if (new Date(serverTime).getMinutes()%5 == 0) {
        serverTime = new Date (serverTime).setMilliseconds(00)
    serverTime = new Date (serverTime).getTime()
    let notesArray = await notesModel.findAll({raw:true})
    for (i=0;i<notesArray.length;i++){
        let noteTime = new Date (notesArray[i].notedate).getTime()
        if (serverTime == noteTime) {
            let phrase = await phraseRand('note', notesArray[i].chatid)
            phrase = phrase.replace('%напоминание%',notesArray[i].notename)
            let user = await usersModel.findOne({where:{id:notesArray[i].chatid}})
            let mess = await bot.sendMessage(notesArray[i].chatid, phrase)
            if (user.repeaton == true) {
                let repeatObj = {repeatBtn: notesArray[i].id, mess: mess.message_id}
                repeatObj = JSON.stringify(repeatObj)
                let btn = {
                    inline_keyboard: [
                        [{text: 'Понял', callback_data: repeatObj}],
                    ]
                }
                let date = new Date(notesArray[i].notedate).setMinutes(new Date(notesArray[i].notedate).getMinutes()+10)
                noterepeatModel.create({
                    chatid: notesArray[i].chatid,
                    noteid: notesArray[i].id,
                    messageid: mess.message_id,
                    notedate: new Date(date).format('Y-M-d H:m'),
                    isfirst: true
                })
                bot.editMessageReplyMarkup(btn, {chat_id: notesArray[i].chatid, message_id:mess.message_id})
            }
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
}

async function repeatSender() {
    let serverTime = new Date ().setSeconds(00)
    if (new Date(serverTime).getMinutes()%5 == 0) {
        serverTime = new Date (serverTime).setMilliseconds(00)
        serverTime = new Date (serverTime).getTime()
        let notesArray = await noterepeatModel.findAll({raw:true})
    for (i=0;i<notesArray.length;i++){
        let noteTime = new Date (notesArray[i].notedate).getTime()
        if (serverTime == noteTime) {
            bot.sendMessage(notesArray[i].chatid, 'Возможно забыто что-то важное..')
            let date = new Date(notesArray[i].notedate).setMinutes(new Date(notesArray[i].notedate).getMinutes()+10)
            noterepeatModel.update({notedate: new Date(date).format('Y-M-d H:m')}, {where:{id:notesArray[i].id}})
        }
    }
    }
}

module.exports.notesSender = notesSender
module.exports.repeatSender = repeatSender
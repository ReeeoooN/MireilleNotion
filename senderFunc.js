const { bot } = require("./TelegramAPI");
const { usersModel, notesModel, noterepeatModel } = require("./bd");
const { phraseRand } = require("./dynamicAnswers");
const { logAdd } = require("./logFunc");

async function notesSender(){ 
    let serverTime = new Date ().setSeconds(00)
    if (new Date(serverTime).getMinutes()%5 == 0) {
        serverTime = new Date (serverTime).setMilliseconds(00)
        serverTime = new Date (serverTime).getTime()
        await logAdd(`Start sending note ${new Date (serverTime)} In UNIX - ${serverTime}`)
        let notesArray = await notesModel.findAll({raw:true})
        for (i=0;i<notesArray.length;i++){
            let noteTime = new Date (notesArray[i].notedate).getTime()
            if (serverTime == noteTime) {
                logAdd(`Sending ${JSON.stringify(notesArray[i])} \n index ${i}`)
                logAdd(`Sending note ${notesArray[i].id} ${new Date(notesArray[i].notedate)} `)
                logAdd(`In UNIX - ${noteTime}`)
                let phrase = await phraseRand('note', notesArray[i].chatid)
                phrase = phrase.replace('%напоминание%',notesArray[i].notename)
                let user = await usersModel.findOne({where:{id:notesArray[i].chatid}})
                let mess 
                if (notesArray[i].id != 3) {
                    mess = await bot.sendMessage(notesArray[i].chatid, phrase)
                }
                if (user.repeaton == true) {
                    let repeatObj = {repeatBtn: notesArray[i].id, mess: mess.message_id}
                    repeatObj = JSON.stringify(repeatObj)
                    let btn = {
                        inline_keyboard: [
                            [{text: 'Понятно', callback_data: repeatObj}],
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
                    logAdd(`And add repeat for id ${notesArray[i].id}`)
                }
                if (notesArray[i].everyday == 1) {
                    let notedate = new Date(notesArray[i].notedate)
                    notedate.setDate(notedate.getDate()+1)
                    notedate.setSeconds(00)
                    logAdd(`New date for id ${notesArray[i].id} ${new Date(notedate)}`)
                    notesModel.update({notedate: new Date(notedate).format('Y-M-d H:m')}, {where: {id:notesArray[i].id}})
                } else {
                    logAdd(`Delete id ${notesArray[i].id}`)
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
        await logAdd(`Start sending repeat ${new Date (serverTime)} In UNIX - ${serverTime}`)
        let notesArray = await noterepeatModel.findAll({raw:true})
    for (i=0;i<notesArray.length;i++){
        let noteTime = new Date (notesArray[i].notedate).getTime()
        if (serverTime == noteTime) {
            logAdd(`Sending repeat for note ${notesArray[i].noteid} ${new Date(notesArray[i].notedate)} `)
            logAdd(`In UNIX - ${noteTime}`)
            bot.sendMessage(notesArray[i].chatid, 'Возможно забыто что-то важное..')
            let date = new Date(notesArray[i].notedate).setMinutes(new Date(notesArray[i].notedate).getMinutes()+10)
            logAdd(`New time repeat for note ${notesArray[i].noteid} ${new Date(date)} `)
            noterepeatModel.update({notedate: new Date(date).format('Y-M-d H:m')}, {where:{id:notesArray[i].id}})
        }
    }
    }
}

module.exports.notesSender = notesSender
module.exports.repeatSender = repeatSender
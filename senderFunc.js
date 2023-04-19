const { bot } = require("./TelegramAPI");
const { usersModel, notesModel, noterepeatModel } = require("./bd");
const { phraseRand } = require("./dynamicAnswers");
const { logAdd } = require("./logFunc");
const { Op, where } = require('sequelize')

async function noteSender() {
    let serverTime = new Date().setMilliseconds(0)
    if (new Date(serverTime).getSeconds() == 0) {
        serverTime = new Date (serverTime).setHours(new Date (serverTime).getHours()+5)
        let notes = await notesModel.findAll({where:{notedate:new Date(serverTime)}, raw:true})
        if (notes.length > 0) {
            logAdd(`Start sending notes ${JSON.stringify(notes, null, '\t')}`)
        }
        for (let i = 0; i < notes.length; i++) {
            let user = await usersModel.findOne({where:{id:notes[i].chatid}})
            let phrase = await phraseRand('note', notes[i].chatid)
            phrase = phrase.replace('%напоминание%',notes[i].notename)
            let mess = await bot.sendMessage(notes[i].chatid, phrase)
            if (user.repeaton == true) {
                let repeatObj = {repeatBtn: notes[i].id, mess: mess.message_id}
                repeatObj = JSON.stringify(repeatObj)
                let btn = {
                    inline_keyboard: [
                        [{text: 'Спасибо', callback_data: repeatObj}],
                    ]
                }
                noterepeatModel.create({
                    chatid: notes[i].chatid,
                    noteid: notes[i].id,
                    messageid: mess.message_id,
                    notedate: new Date(notes[i].notedate).setMinutes(new Date(notes[i].notedate).getMinutes()+10),
                    isfirst: true
                })
                bot.editMessageReplyMarkup(btn, {chat_id: notes[i].chatid, message_id:mess.message_id})
                logAdd(`And add repeat for id ${notes[i].id}`)
            }
            if (notes[i].everyday == true) { 
                notesModel.update({notedate:new Date(notes[i].notedate).setDate(new Date(notes[i].notedate).getDate()+1)}, {where:{id:notes[i].id}})
            } else {
                notesModel.destroy({where:{id:notes[i].id}})
            }
        }
        
    }
       
}

async function repeatSender() {
    let serverTime = new Date().setMilliseconds(0)
    if (new Date(serverTime).getSeconds() == 0) {
        serverTime = new Date (serverTime).setHours(new Date (serverTime).getHours()+5)
        let notes = await noterepeatModel.findAll({where:{notedate:new Date(serverTime)}, raw:true})
        if (notes.length > 0) {
            logAdd(`Start sending repeats ${JSON.stringify(notes, null, '\t')}`)
        }
        for (let i = 0; i < notes.length; i++) {
            bot.sendMessage(notes[i].chatid, "Возможно, было забыто что-то важное!")
            noterepeatModel.update({notedate:new Date(notes[i].notedate).setMinutes(new Date(notes[i].notedate).getMinutes()+10)}, {where:{noteid:notes[i].noteid}})
            logAdd(`updated repeat ${notes[i].noteid}`)
        }
        
    }
}

module.exports.noteSender = noteSender
module.exports.repeatSender = repeatSender
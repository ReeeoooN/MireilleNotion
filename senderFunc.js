const { bot } = require("./TelegramAPI");
const { usersModel, notesModel, noterepeatModel } = require("./bd");
const { phraseRand } = require("./dynamicAnswers");
const { logAdd } = require("./logFunc");
const { Op, where } = require('sequelize');

async function noteSender() {
    let serverTime = new Date().setMilliseconds(0)
    if (new Date(serverTime).getSeconds() == 0) {
        logAdd(`Server time after if ${new Date (serverTime)}`)
        serverTime = new Date (serverTime).setHours(new Date (serverTime).getHours()+5)
        let notesLog = await notesModel.findAll({raw:true})
        logAdd(`All notes ${JSON.stringify(notesLog, null, '\t')}`)
        let notes = await notesModel.findAll({where:{notedate:new Date(serverTime)}, raw:true})
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
                    count: 0
                })
                bot.editMessageReplyMarkup(btn, {chat_id: notes[i].chatid, message_id:mess.message_id})
                logAdd(`And add repeat for id ${notes[i].id}`)
            }
            noteReplacer(notes[i])
        }
        let repeats = await noterepeatModel.findAll({where:{notedate:new Date(serverTime)}, raw:true})
        if (repeats.length > 0) {
            logAdd(`Start sending repeats ${JSON.stringify(repeats, null, '\t')}`)
        }
        for (let i = 0; i < repeats.length; i++) {
            if (repeats[i].count < 5) {
                bot.sendMessage(repeats[i].chatid, "Возможно, было забыто что-то важное!")
                noterepeatModel.update({notedate:new Date(repeats[i].notedate).setMinutes(new Date(repeats[i].notedate).getMinutes()+10), count:repeats[i].count+1}, {where:{noteid:repeats[i].noteid}})
            } else {
                bot.sendMessage(repeats[i].chatid, "Последний раз повторяю, возможно, было забыто что-то важное!")
                noterepeatModel.destroy({where:{noteid:repeats[i].noteid}})
            }
            logAdd(`updated repeat ${repeats[i].noteid}`)
        }
        return
    }
    return
       
}

function noteReplacer(note){
    note.period = JSON.parse(note.period)
    console.log(note);
    if (note.type == 'simple') {
        notesModel.destroy({where:{id:note.id}})
    } else if (note.period.type == 'perday') {
        console.log(note.period.data);
        notesModel.update({notedate:new Date(note.notedate).setDate(new Date(note.notedate).getDate()+Number(note.period.data))}, {where:{id:note.id}})
    } else if (note.period.type == 'permount') {
        notesModel.update({notedate:new Date(note.notedate).setMonth(new Date(note.notedate).getMonth()+1)}, {where:{id:note.id}})
    } else if (note.period.type == 'perweek') {
        note.period.data = Object.values(note.period.data)
        let weekday = getWeekDay (new Date(note.notedate))
        let weekdaymin
        let weekdiff = null
        for (let i = 0; i < note.period.data.length; i++) {
            if (note.period.data[i] == true) {
                weekdaymin = i
                break
            }
        }
        for (let i = weekday+1; i < note.period.data.length; i++) {
            if (note.period.data[i] == true) {
                console.log(i);
                weekdiff = i - weekday
                console.log(weekdiff);
                break
            }
        }
        logAdd(weekdiff + ' ' + weekdaymin + " " + weekday)
        if (weekdiff !== null) {
            notesModel.update({notedate:new Date(note.notedate).setDate(new Date(note.notedate).getDate()+weekdiff)}, {where:{id:note.id}})
        }else {
            notesModel.update({notedate:new Date(note.notedate).setDate(new Date(note.notedate).getDate()+7-weekday+weekdaymin)}, {where:{id:note.id}})
        }
    }
    
}

function getWeekDay(date){
    date = new Date(date).setHours(new Date (date).getHours()-5)
console.log(new Date (date).getDay());
    switch (new Date (date).getDay()){
        case 0: return 6
        break
        case 1: return 0
        break
        case 2: return 1
        break
        case 3: return 2
        break
        case 4: return 3
        break
        case 5: return 4
            break
        case 6: return 5
            break
    }
}

module.exports.noteSender = noteSender
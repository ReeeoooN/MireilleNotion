const { confirm, getHour, getTime, back, eventRedBtn, mainmenuBtnCreate } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel } = require("./bd");
const {monthBuilder} = require("./createFuncold");
const { logAdd } = require("./logFunc");
const { Op } = require("sequelize");
const { preCreator } = require("./createFunc");

async function selectNotes (chatid) {
    let messArray = []
    let notes = await notesModel.findAll({where:{[Op.or]: [{ chatid: chatid }, { coopid: chatid }]}, raw:true})
    async function noteListener(msg) {
        if (msg.message.chat.id == chatid) {
            if (msg.data == 'start') {
                for (let i = 0; i < messArray.length; i++) {
                    bot.deleteMessage(chatid, messArray[i])                    
                }
                bot.removeListener('callback_query', noteListener)
            } else if (msg.data.indexOf('{')!== -1) {
                msg.data = JSON.parse(msg.data)
                if (msg.data.type == 'delete') {
                    notesModel.destroy({where:{id:msg.data.noteid}})
                    bot.editMessageText('Уведомление удалено', {chat_id: chatid, message_id: msg.message.message_id})
                } else if (msg.data.type == 'edit') {
                    for (let i = 0; i < messArray.length; i++) {
                        bot.deleteMessage(chatid, messArray[i])                    
                    }
                    bot.removeListener('callback_query', noteListener)
                    editNote(msg.data.noteid, msg.message.chat.id)
                }
            } else {
                for (let i = 0; i < messArray.length; i++) {
                    bot.deleteMessage(chatid, messArray[i])                    
                }
                bot.removeListener('callback_query', noteListener)
            }
        }
    }
    bot.on('callback_query', noteListener)
    if (notes.length>0) {
        let user = await usersModel.findOne({where:{id: notes[0].chatid}, raw:true})
        for(i=0;i<notes.length;i++) {
            let editBtn = {type: 'edit', noteid: notes[i].id}
            let deleteBtn = {type: 'delete', noteid: notes[i].id}
            let noteBtn = {}
            if (notes[i].coop == false) {
                noteBtn = {
                    reply_markup: JSON.stringify( {
                        inline_keyboard: [
                            [{text: 'Удалить', callback_data: JSON.stringify(deleteBtn)}, {text: 'Редактировать', callback_data: JSON.stringify(editBtn)}],
                        ]
                    })
                }
            } else {
                noteBtn = {
                    reply_markup: JSON.stringify( {
                        inline_keyboard: [
                            [{text: 'Удалить', callback_data: JSON.stringify(deleteBtn)}],
                        ]
                    })
                }
            }
            let date = new Date(notes[i].notedate)
            date = date.setHours(date.getHours()+user.timediff-5)
            let sendString = `Уведомление "${notes[i].notename}" - ${new Date(date).format('d.M.Y h:m')}`
            if (notes[i].type == 'ed') {
                sendString = sendString + '\n Ежедневное '
            } else if (notes[i].type == 'period') {
                sendString = sendString + '\n Переодическое '
                notes[i].period = JSON.parse(notes[i].period)
                if (notes[i].period.type == 'perday') {
                    sendString = sendString + `(Раз в ${notes[i].period.data} дней)`
                } else if (notes[i].period.type == 'permount') {
                    sendString = sendString + `(Раз в месяц)`
                } else if (notes[i].period.type == 'perweek') {
                    sendString = sendString + `(`
                    if (notes[i].period.data.mon == true) {
                        sendString = sendString + ` Понедельник `
                    }
                    if (notes[i].period.data.tue == true) {
                        sendString = sendString + ` Вторник `
                    }
                    if (notes[i].period.data.wed == true) {
                        sendString = sendString + ` Среда `
                    }
                    if (notes[i].period.data.thu == true) {
                        sendString = sendString + ` Четверг `
                    }
                    if (notes[i].period.data.fri == true) {
                        sendString = sendString + ` Пятница `
                    }
                    if (notes[i].period.data.sat == true) {
                        sendString = sendString + ` Суббота `
                    }
                    if (notes[i].period.data.sun == true) {
                        sendString = sendString + ` Воскресенье `
                    }
                    sendString = sendString + `)`
                }
            }
            if (notes[i].coop == true) {
                coopuser = await usersModel.findOne({where:{id:notes[i].chatid}})
                sendString = sendString + `\nУведомление для ${coopuser.name}`
            }
            let mess = await bot.sendMessage(chatid, sendString, noteBtn)
            messArray.push(mess.message_id)
        }
        let mess = await bot.sendMessage(chatid, 'Это были все уведомления', back)
        messArray.push(mess.message_id)
    } else {
        await bot.sendMessage(chatid, 'Уведомлений нет', back)
    }
}

async function editNote(noteid, chatid) {
    notesModel.findOne({where:{id:noteid}}).then(res=>{
        console.log(res);
        if (!res) {
            bot.sendMessage(chatid, 'Уведомления больше нет', back)
        } else {
            async function eventRedlist (msg) {
                if (msg.message.chat.id == chatid) {
                    bot.removeListener('callback_query', eventRedlist)
                    if (msg.data == 'redparam') {
                        bot.deleteMessage(chatid, msg.message.message_id)
                        let note = {
                            id:res.id, 
                            chatid: res.chatid, 
                            message:msg.message.message_id, 
                            coop: res.coop, 
                            coopid: res.coopid, 
                            type: null, 
                            period:null, 
                            stade: 'giveParam', 
                            date: new Date(res.notedate).format(`Y-M-d`), 
                            hour: new Date(res.notedate).getHours(), 
                            min: new Date(res.notedate).getMinutes(), 
                            eventName: res.notename,
                            editDate: false
                        }
                        preCreator(note)
                    }
                    if (msg.data == 'redname') {
                        let note = {
                            id:res.id, 
                            chatid: res.chatid, 
                            message:msg.message.message_id, 
                            coop: res.coop, 
                            coopid: res.coopid, 
                            type: res.type, 
                            period:JSON.parse(res.period), 
                            stade: 'giveName', 
                            date: new Date(res.notedate).format(`Y-M-d`), 
                            hour: new Date(res.notedate).getHours(), 
                            min: new Date(res.notedate).getMinutes(), 
                            eventName: null,
                            editDate: false
                        }
                        preCreator(note)
                    }
                    if (msg.data == 'redtime') {
                        bot.deleteMessage(chatid, msg.message.message_id)
                        let note 
                        if (res.type == 'ed') {
                            note = {
                                id:res.id, 
                                chatid: res.chatid, 
                                message:msg.message.message_id, 
                                coop: res.coop, 
                                coopid: res.coopid, 
                                type: res.type, 
                                period:JSON.parse(res.period), 
                                stade: 'giveDate', 
                                date: new Date(res.notedate).format(`Y-M-d`), 
                                hour: null, 
                                min: null, 
                                eventName: res.eventName,
                                editDate: true
                            }
                        } else {
                            note = {
                                id:res.id, 
                                chatid: res.chatid, 
                                message:msg.message.message_id, 
                                coop: res.coop, 
                                coopid: res.coopid, 
                                type: res.type, 
                                period:JSON.parse(res.period), 
                                stade: 'giveDate', 
                                date: null, 
                                hour: null, 
                                min: null, 
                                eventName: res.eventName,
                                editDate: true
                            }
                        }
                        preCreator(note)
                    }
                }
            }
            bot.sendMessage(chatid, `Уведомление "${res.notename}"`, eventRedBtn)
            bot.on('callback_query', eventRedlist)
        }
    })
}

module.exports.selectNotes = selectNotes
const { confirm, getHour, getTime, back, replyBack, eventRedBtn, mainmenuBtnCreate } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');
const { usersModel, notesModel, chatModel } = require("./bd");
const {monthBuilder} = require("./createFunc");
const { logAdd } = require("./logFunc");

async function editNotesdate (note) {
    let year = Number(new Date().format('Y'))
    let month = Number(new Date().format('M'))
    let btn
    if (note.everyday == 1) {
        let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        newBtn.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
    } else {
        btn = monthBuilder(month, year)
    }
    bot.editMessageReplyMarkup(btn, {chat_id: note.chatid, message_id: note.mess})
    async function dateBuilder(msg) {
        let chatid = note.chatid
        let mess = note.mess
        if(msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data !== 'myEdNote' && msg.data !== 'myinfo' ) {
            if (note.date === 0) {
                if (msg.data !== 'backmonth' && msg.data !== 'nextmonth' ) {
                    note.date = msg.data
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        newBtn.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === 'backmonth') {
                    if(month == 1) {
                        month = 12
                        year--
                    } else {
                        month--
                    }
                    btn = monthBuilder(month, year)
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === 'nextmonth') {
                    if (month == 12) {
                        month = 1
                        year++ 
                    } else {
                        month ++
                    }
                    btn = monthBuilder(month, year)
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                }
            } else if (note.hour === 0) {
                if (msg.data !== "hourback" && msg.data !== 'hournext' && msg.data !== 'back') {
                    note.hour = msg.data
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                    let getmin = [
                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === "hourback") {
                    const oneDay = 1000 * 60 * 60 * 24; 
                    note.date = new Date(note.date).getTime() - oneDay
                    note.date = new Date(note.date).format('Y-M-d')
                    let backday = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        backday.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: backday
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === "hournext") {
                    const oneDay = 1000 * 60 * 60 * 24; 
                    note.date = new Date(note.date).getTime() + oneDay
                    note.date = new Date(note.date).format('Y-M-d')
                    let backday = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        backday.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: backday
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === 'back') {
                    
                    if (note.everyday == 1) {
                        bot.removeListener('callback_query', dateBuilder)
                        bot.deleteMessage(chatid, mess)
                        let mess = await bot.sendMessage(chatid, 'Ты вернулся в главное меню', await mainmenuBtnCreate(chatid))
                        createChatDB(chatid, mess.message_id)
                    } else {
                        note.date = 0
                        let year = Number(new Date().format('Y'))
                        let month = Number(new Date().format('M'))
                        btn = monthBuilder(month, year)
                        bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                    }
                }
            } else if (note.min === 0) {
                if (msg.data !== "minback" && msg.data !== 'minnext' && msg.data !== 'back') {
                    await bot.removeListener('callback_query', dateBuilder)
                    note.min = msg.data
                    if (note.everyday === 1){
                        let noteDate = new Date (note.date)
                        noteDate = new Date (noteDate).setHours(note.hour)
                        noteDate = new Date (noteDate).setMinutes(note.min)
                        noteDate = new Date (noteDate).getTime()
                        let dateNow = new Date ().getTime()
                        if (noteDate < dateNow) {
                            noteDate = new Date (noteDate).setDate(new Date (noteDate).getDate()+1)
                            note.date = new Date (noteDate).format('Y-M-d')
                        }
                    }
                    bot.deleteMessage(chatid, note.mess)
                    await bot.sendMessage(note.chatid, `Напомню ${new Date(note.date).format('d.M.Y')} в ${note.hour}:${note.min}`)
                    let user = await usersModel.findOne({where:{id:note.chatid}, raw:true})
                    let date = new Date(`${note.date} ${note.hour}:${note.min}:00`)
                    date = new Date(date).setHours(new Date(date).getHours()-user.timediff)
                    await notesModel.update({notedate: `${new Date(date).format(`Y-M-d H:m`)}`}, {where:{id: note.id}}).catch(err=>{
                        usersModel.findAll({where:{isadmin: true}}).then(res=>{
                            console.log("Error - " + err);
                            for (i=0; i<res.length; i++){
                                bot.sendMessage(res[i].id, "Йо тут ошибка " + err);
                                
                            }
                            bot.sendMessage(note.chatid, "Произошла ошибка, попробуйте еще раз.")
                        })
                    })
                    logAdd(`Change note ${JSON.stringify(note)}`)
                    let mess = await bot.sendMessage(chatid, 'Мы вернулись в главное меню.', await mainmenuBtnCreate(chatid))
                    createChatDB(chatid, mess.message_id)
                    note = 0
                    
                } else if (msg.data === "minback") {
                    note.hour--
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                    let getmin = [
                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === "minnext") {
                    note.hour++
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')} время ${note.hour}:`, callback_data: 'dick' }]]
                    let getmin = [
                        [{text: `${note.hour}:00`, callback_data: '00'}, {text: `${note.hour}:05`, callback_data: '05'}, {text: `${note.hour}:10`, callback_data: '10'},
                        {text: `${note.hour}:15`, callback_data: '15'}, {text: `${note.hour}:20`, callback_data: '20'}, {text: `${note.hour}:25`, callback_data: '25'}, ],
                        [{text: `${note.hour}:30`, callback_data: '30'}, {text: `${note.hour}:35`, callback_data: '35'}, {text: `${note.hour}:40`, callback_data: '40'},
                        {text: `${note.hour}:45`, callback_data: '45'}, {text: `${note.hour}:50`, callback_data: '50'}, {text: `${note.hour}:55`, callback_data: '55'}, ],
                        [{text: '<', callback_data: 'minback'}, {text: 'Назад', callback_data:'back'}, {text: '>', callback_data: 'minnext'}]
                    ]
                    for (i=0; i<getmin.length; i++){
                        newBtn.push(getmin[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                } else if (msg.data === "back") {
                    note.hour = 0
                    let newBtn = [[{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }]]
                    for (i=0; i<getHour.length; i++){
                        newBtn.push(getHour[i])
                    }
                    btn = {
                        inline_keyboard: newBtn
                    }
                    bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess})
                }
            }
        } else if (msg.data === 'start') {
            bot.removeListener('callback_query', dateBuilder)
            bot.deleteMessage(chatid, mess)
        }
    }
    bot.on('callback_query', dateBuilder)
}

async function selectNotes (chatid) {
    notesModel.findAll({where:{chatid:chatid}, raw:true}).then(async res=>{
        if (res.length>0) {
            async function listener(msg) {
                if(msg.message.chat.id === res[0].chatid && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data.indexOf('del-')!== -1 ){
                    let index = 0
                    for (i=0;i<res.length;i++){
                        if (msg.data.slice(4) == res[i].id) {
                            index = i
                            break
                        }
                    }
                    logAdd(`Delete note ${res[index].id}, note was created ${res[index].createdAt}`)
                    bot.editMessageText(`Уведомление "${res[index].notename}" было удалено`, {chat_id: res[0].chatid, message_id: msg.message.message_id})
                    notesModel.destroy({where:{id: msg.data.slice(4)}})
                }
                if(msg.message.chat.id === res[0].chatid && msg.data !== 'noteAdd' && msg.data !== 'myNote' && msg.data !== 'start' && msg.data.indexOf('ed-')!== -1 ){
                    let index = 0
                    for (i=0;i<res.length;i++){
                        if (msg.data.slice(3) == res[i].id) {
                            index = i
                            break
                        }
                    }
                    await chatModel.destroy({where:{messageid: msg.message.message_id}})
                    await chatModel.findAll({where:{chatid:chatid}}).then(res=>{
                        if (res.length > 0) {
                           for(i=0;i<res.length;i++){
                            bot.deleteMessage(res[i].chatid,res[i].messageid)
                            chatModel.destroy({where:{messageid: res[i].messageid}})
                           }
                        }
                    })
                    let mess = msg.message.message_id
                    bot.removeListener('callback_query', listener)
                    async function notered(msg){
                        if (res[index].chatid === msg.message.chat.id && msg.data === 'redtime'){
                            bot.removeListener('callback_query', notered)
                            if(res[index].everyday == 1){
                                let note = {
                                    id: res[index].id,
                                    everyday: res[index].everyday,
                                    mess: mess,
                                    chatid: res[index].chatid,
                                    date: new Date (res[index].notedate).format('Y-M-d'),
                                    hour: 0,
                                    min: 0
                                }
                                editNotesdate(note)
                            } else {
                                let note = {
                                    id: res[index].id,
                                    everyday: res[index].everyday,
                                    mess: mess,
                                    chatid: res[index].chatid,
                                    date: 0,
                                    hour: 0,
                                    min: 0
                                }
                                editNotesdate(note)
                            }
                        }
                        if (res[index].chatid === msg.message.chat.id && msg.data === 'redname'){
                            bot.removeListener('callback_query', notered)
                            bot.editMessageText('Введи новое название', {chat_id: res[index].chatid, message_id:mess})
                            async function redName (msg) {
                                if (res[index].chatid === msg.chat.id && msg.text !== '/start') {
                                    notesModel.update({notename:msg.text}, {where:{id:res[index].id}})
                                    logAdd(`Change note name ${msg.text}`)
                                    bot.deleteMessage(res[index].chatid, mess)
                                    let message = await bot.sendMessage(res[index].chatid, `Название было изменено на "${msg.text}"`, back)
                                    bot.removeListener('message', redName)
                                    async function delmess (msg) {
                                        if (msg.data = 'starbackt' && msg.message.chat.id === res[index].chatid) {
                                            bot.deleteMessage(msg.message.chat.id, message.message_id)
                                            bot.removeListener('callback_query', delmess)
                                        }
                                    }
                                    bot.on('callback_query', delmess)
                                } else if (res[index].chatid === msg.chat.id && msg.text === '/start') {
                                    bot.deleteMessage(res[index].chatid, mess)
                                    bot.removeListener('message', redName)
                                }
                            }
                            bot.on('message', redName)
                        }
                        if (res[index].chatid === msg.message.chat.id && msg.data === 'start'){
                            bot.deleteMessage(res[index].chatid, mess)
                            await chatModel.findAll({where:{chatid:chatid}}).then(res=>{
                                if (res.length > 0) {
                                   for(i=0;i<res.length;i++){
                                    bot.deleteMessage(res[i].chatid,res[i].messageid)
                                    chatModel.destroy({where:{messageid: res[i].messageid}})
                                   }
                                }
                            })
                            bot.removeListener('callback_query', notered)
                        }
                    }
                    bot.on('callback_query', notered)
                    bot.editMessageReplyMarkup(eventRedBtn, {chat_id: res[index].chatid, message_id: mess})
                }
                if(msg.message.chat.id === res[0].chatid && (msg.data === 'start' || msg.data === 'noteAdd' || msg.data === 'myNote' || msg.data === 'myinfo' || msg.data === 'myEdNote')) {
                    bot.removeListener('callback_query', listener)
                    chatModel.findAll({where:{chatid:chatid}}).then(res=>{
                        if (res.length > 0) {
                           for(i=0;i<res.length;i++){
                            bot.deleteMessage(res[i].chatid,res[i].messageid)
                            chatModel.destroy({where:{messageid: res[i].messageid}})
                           }
                        }
                    })
                }
            }
            bot.on('callback_query', listener)
            let user = await usersModel.findOne({where:{id: res[0].chatid}, raw:true})
            for(i=0;i<res.length;i++) {
                let delBtn = {
                    reply_markup: JSON.stringify( {
                        inline_keyboard: [
                            [{text: 'Удалить', callback_data: `del-${res[i].id}`}, {text: 'Редактировать', callback_data: `ed-${res[i].id}`}],
                        ]
                    })
                }
                let date = new Date(res[i].notedate)
                date = date.setHours(date.getHours()+user.timediff)
                if (res[i].everyday == 1) {
                    let mess = await bot.sendMessage(res[i].chatid, `Ежедневное уведомление "${res[i].notename}" - ${new Date(date).format('h:m')}`, delBtn) 
                    createChatDB(res[i].chatid, mess.message_id)
                } else {
                    let mess = await bot.sendMessage(res[i].chatid, `Уведомление "${res[i].notename}" - ${new Date(date).format('d.M.Y h:m')}`, delBtn) 
                    createChatDB(res[i].chatid, mess.message_id)
                }
            }
            bot.sendMessage(res[0].chatid, 'Это были все уведомления', back)

        } else {
            await bot.sendMessage(chatid, 'Уведомлений нет', back)
        }
    })
}

module.exports.selectNotes =selectNotes

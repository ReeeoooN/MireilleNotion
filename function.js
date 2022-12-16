const { confirm, getHour, back } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const format = require('node.date-time');

function fuck (chatid, err) {
    bot.sendMessage(chatid, 'Простите, я сломался, разработчик уже в курсе неполадки, вскоре их поправят')
    bot.sendMessage(902064437, `Бро, я сломался ${err}`)
}

function monthBuilder(month, year) {
    let nextmonth;
    let nextyear = year
    if (month == 12) {
        nextmonth = 1
        nextyear = year+1
    } else {
        nextmonth = month+1
    }
    const dateStart = new Date(`${year}-${month}-1`); 
    const dateEnd = new Date(`${nextyear}-${nextmonth}-1`);
    const oneDay = 1000 * 60 * 60 * 24; 
    const diffInTime = dateEnd.getTime() - dateStart.getTime();
    const diffInDays = Math.round(diffInTime / oneDay); 
    let dayArray = []
    for (i=0; i<diffInDays; i++) {
        let day = new Date (`${year}-${month}-${i+1}`)
        let dayObj = {
            day: i+1,
            weekday: day.getDay()
        }
        if(dayObj.weekday==0){
            dayObj.weekday=7
        }
        dayArray[i] = dayObj
    }
    let btnArray = []
    let allMonth =['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    btnArray[0] = [{text: `${allMonth[month-1]} ${year}`, callback_data: 'dick'}]
    btnArray[1] = [{text: 'Пн', callback_data: 'dick'}, {text: 'Вт', callback_data: 'dick'},
    {text: 'Ср', callback_data: 'dick'}, {text: 'Чт', callback_data: 'dick'},
    {text: 'Пт', callback_data: 'dick'}, {text: 'Сб', callback_data: 'dick'},
    {text: 'Вс', callback_data: 'dick'}]
    let emptySpace = {day: ' ', weekday:'dick'}
    let different = dayArray[0].weekday -1
    for(i=0; i<different; i++) {
        dayArray.unshift(emptySpace)
    }
    different=7-dayArray[dayArray.length-1].weekday

    for(i=0; i<different;i++){
        dayArray.push(emptySpace)
    }
    for(i=0;i<dayArray.length;i=i+7){
        let transferArray=[]
        for(j=0;j<7;j++){
            let transferObject
            if(dayArray[i+j].day == ' ') {
                transferObject = {text: `${dayArray[i+j].day}`, callback_data: `dick`}
            } else {
                transferObject = {text: `${dayArray[i+j].day}`, callback_data: `${year}-${month}-${dayArray[i+j].day}`}
            }
            
            transferArray.push(transferObject)
        }
        btnArray.push(transferArray)
    }
    btnArray.push([{text: '<', callback_data: 'backmonth'}, {text: 'Назад', callback_data:'start'}, {text: '>', callback_data: 'nextmonth'} ])
    btn = {
            inline_keyboard: btnArray
    }
    return btn;
}


async function notecreatorold(chatid) {
    let mess = await bot.sendMessage(chatid, 'Введи название события')
    createChatDB(chatid, mess.message_id)
    let listener = new Promise (async (resolve, reject)=>{
        bot.on('message', msg=>{
            if (chatid === msg.chat.id && msg.text != '/start') {
                resolve(msg.text)
            }
        })
    }).then(async res=>{
        deleteBotMessage(chatid)
        let mess = await bot.sendMessage(chatid, `Событие будет называться "${res}"?`, confirm)
        createChatDB(chatid, mess.message_id)
        listener = new Promise (async (resolve, reject)=>{
            bot.on('callback_query', async msg=>{
                if (msg.message.chat.id === chatid) {
                    resolve({data: msg.data, iventname: res})
                }
            })
        }).then(async res=>{
            if (res.data === 'confirmanswer') {
                deleteBotMessage(chatid)
                let year = Number(new Date().format('Y'))
                let month = Number(new Date().format('M'))
                   let btn = {reply_markup: JSON.stringify(
                    monthBuilder(month, year)
                   )} 
                let mess = await bot.sendMessage(chatid, 'Выбери день:', btn)
                editmess = mess.message_id
                createChatDB(chatid, mess.message_id)
                listener = new Promise (async resolve=>{
                    bot.on('callback_query', async msg =>{
                        if ((msg.data !== 'dick' && msg.data !== 'backmonth' && msg.data !== 'nextmonth') && msg.message.chat.id === chatid ){
                            resolve({data: msg.data, iventname: res.iventname})
                        }
                        if (msg.data == 'backmonth') {
                            if(month == 1) {
                                month = 12
                                year--
                            } else {
                                month--
                            }
                            btn = monthBuilder(month, year)
                            bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                        }
                        if (msg.data === 'nextmonth') {
                            if (month == 12) {
                                month = 1
                                year++ 
                            } else {
                                month ++
                            }
                            btn = monthBuilder(month, year)
                            bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: editmess})
                        }
                    })
                }).then(async res=>{
                    if(res.data!= 'start') {
                        console.log(res);
                    deleteBotMessage(chatid)
                    let mess = await bot.sendMessage(chatid, 'Выбери время:', getHour)
                    createChatDB(chatid, mess.message_id)
                    listener = new Promise (async resolve=>{
                        bot.on('callback_query', async msg =>{
                            if ((msg.data !== 'dick' && msg.data !== 'backhour' && msg.data !== 'nexthour') && msg.message.chat.id === chatid ){
                                resolve({data: res.data, iventname: res.iventname, hour:msg.data})
                            }
                        })
                    }).then(async res=>{
                        console.log(Number(res.hour));
                        if(res.hour!='start'){
                            console.log(res);
                        deleteBotMessage(chatid)
                         let getMin = {
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{text: `${res.hour}:00`, callback_data: '00'}, {text: `${res.hour}:05`, callback_data: '05'}, {text: `${res.hour}:10`, callback_data: '10'},
                                    {text: `${res.hour}:15`, callback_data: '15'}, {text: `${res.hour}:20`, callback_data: '20'}, {text: `${res.hour}:25`, callback_data: '25'}, ],
                                    [{text: `${res.hour}:30`, callback_data: '30'}, {text: `${res.hour}:35`, callback_data: '35'}, {text: `${res.hour}:40`, callback_data: '40'},
                                    {text: `${res.hour}:45`, callback_data: '45'}, {text: `${res.hour}:50`, callback_data: '50'}, {text: `${res.hour}:55`, callback_data: '55'}, ],
                                    [{text: 'Назад', callback_data:'start'},]
                                ]
                            })
                        }
                    
                        let mess = await bot.sendMessage(chatid, 'Выбери время:', getMin)
                        createChatDB(chatid, mess.message_id)
                        listener = new Promise (async resolve=>{
                            bot.on('callback_query', async msg=>{
                                if ((msg.data !== 'dick' && msg.data !== 'backmin' && msg.data !== 'nextmin') && msg.message.chat.id === chatid ){
                                    resolve({data: res.data, iventname:res.iventname, hour: res.hour, min: msg.data})
                                }
                            })
                        }).then(res=>{
                            if (res.min != 'start') {
                                console.log(res);
                            console.log(new Date(`${res.data}T${res.hour}:${res.min}`).format('d.M.Y H:m'));
                            deleteBotMessage(chatid)
                            bot.sendMessage(chatid, `Для события "${res.iventname}", было создано напоминание ${new Date(`${res.data}T${res.hour}:${res.min}`).format('d.M.Y')} в ${new Date(`${res.data}T${res.hour}:${res.min}`).format('H:m')}`)
                            }
                        })
                        }
                    })
                    }
                })
            }
            if (res.data === 'notconfirmanswer' ) {
                deleteBotMessage(chatid)
                if (chatid == 232060407) {
                   let mess = await bot.sendMessage(chatid, 'Пидора ответ)))0)')
                   createChatDB(chatid, mess.message_id)
                }
                await notecreator(chatid)
            }
        })
    })
        
}

async function notecreator(chatid) {
    let mess = await bot.sendMessage(chatid, 'Введи название события')
    createChatDB(chatid, mess.message_id)
    let listener = new Promise (async (resolve, reject)=>{
        bot.on('message', async msg=>{
            if (chatid === msg.chat.id && msg.text != '/start') {
                resolve(msg.text)
            } else {
                reject('Ты ввел команду, можешь попробовать еще раз')
            }
        })
    }).then(async res=>{
        deleteBotMessage(chatid)
        let mess = await bot.sendMessage(chatid, `Событие будет называться "${res}"?`, confirm)
        createChatDB(chatid, mess.message_id)
        listener = new Promise (async (resolve, reject)=>{
            bot.on('callback_query', async msg=>{
                if (msg.data == 'confirmanswer' && msg.message.chat.id === chatid) {
                    resolve(res)
                }
                if (msg.data == 'start') {
                    reject('back')
                }
            })
        }).then(async res=>{
            deleteBotMessage(chatid)
            let year = Number(new Date().format('Y'))
                let month = Number(new Date().format('M'))
                   let btn = {reply_markup: JSON.stringify(
                    monthBuilder(month, year)
                   )} 
                let mess = await bot.sendMessage(chatid, 'Укажи дату:', btn)
                let note = {date: 0, hour: 0, min: 0, eventName: res}
                listener = new Promise (async(resolve, reject)=>{
                    bot.on('callback_query', async msg=>{
                        if (note.date === 0 && msg.message.chat.id === chatid) {
                            if (msg.data !== 'dick' && msg.data !== 'backmonth' && msg.data !== 'nextmonth' && msg.data !== 'start' && msg.data !== 'noteAdd' && msg.data !== 'myNote') {
                                note.date = msg.data
                                let newBtn = []
                                newBtn.push([{text: `${new Date(note.date).format('d.M.Y')}`, callback_data: 'dick' }])
                                newBtn.push([{text: '00:00', callback_data: '00'}, {text: '01:00', callback_data: '01'}, {text: '02:00', callback_data: '02'},
                                {text: '03:00', callback_data: '03'}, {text: '04:00', callback_data: '04'}, {text: '05:00', callback_data: '05'}])
                                newBtn.push([{text: '06:00', callback_data: '06'}, {text: '07:00', callback_data: '07'}, {text: '08:00', callback_data: '08'},
                                {text: '09:00', callback_data: '09'}, {text: '10:00', callback_data: '10'}, {text: '11:00', callback_data: '11'}])
                                newBtn.push([{text: '12:00', callback_data: '12'}, {text: '13:00', callback_data: '13'}, {text: '14:00', callback_data: '14'},
                                {text: '15:00', callback_data: '15'}, {text: '16:00', callback_data: '16'}, {text: '17:00', callback_data: '17'}])
                                newBtn.push([{text: '18:00', callback_data: '18'}, {text: '19:00', callback_data: '19'}, {text: '20:00', callback_data: '20'},
                                {text: '21:00', callback_data: '21'}, {text: '22:00', callback_data: '22'}, {text: '23:00', callback_data: '23'}])
                                newBtn.push([{text: '<', callback_data: 'hourback'},{text: 'Назад', callback_data:'back'},{text: '>', callback_data: 'hournext'}])
                                btn = {
                                    inline_keyboard: newBtn
                                }
                                bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                            } else if (msg.data === 'backmonth') {
                                if(month == 1) {
                                    month = 12
                                    year--
                                } else {
                                    month--
                                }
                                btn = monthBuilder(month, year)
                                bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: mess.message_id})
                            } else if (msg.data === 'nextmonth') {
                                if (month == 12) {
                                    month = 1
                                    year++ 
                                } else {
                                    month ++
                                }
                                btn = monthBuilder(month, year)
                                bot.editMessageReplyMarkup(btn, {chat_id: chatid, message_id: editmess})
                            } else if (msg.data === 'start') {
                                reject(mess)
                            } else {
                                reject(mess)
                            }
                        } else if (note.hour === 0 && msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote') {

                        } else if (note.min === 0 && msg.message.chat.id === chatid && msg.data !== 'dick' && msg.data !== 'noteAdd' && msg.data !== 'myNote') {

                        }
                    })
                }).catch(err=>{
                    bot.editMessageText('Меню закрыто', {chat_id: chatid, message_id: err.message_id})
                })
        }).catch (err=>{
            
        })
    }).catch(err =>{
        bot.editMessageText(err, {chat_id: chatid, message_id: mess.message_id})
    }) 
}

module.exports.fuck = fuck
module.exports.notecreator = notecreator
module.exports.monthBuilder = monthBuilder
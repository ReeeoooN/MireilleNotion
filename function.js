const { confirm } = require("./botBtn")
const { createChatDB, deleteBotMessage } = require("./messdel")
const { bot } = require("./TelegramAPI")
const JSJoda = require('js-joda'); 
const LocalDate = JSJoda.LocalDate;
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
    console.log(dayArray);
    let btnArray = []
    let allMonth =['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    btnArray[0] = [{text: `${allMonth[month-1]} ${year}`, callback_data: 'dick'}]
    btnArray[1] = [{text: 'Пн', callback_data: 'dick'}, {text: 'Вт', callback_data: 'dick'},
    {text: 'Ср', callback_data: 'dick'}, {text: 'Чт', callback_data: 'dick'},
    {text: 'Пт', callback_data: 'dick'}, {text: 'Сб', callback_data: 'dick'},
    {text: 'Вс', callback_data: 'dick'}]
    let emptySpace = {day: ' ', weekday:'dick'}
    let different = 7-dayArray[0].weekday
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
            let transferObject = {text: `${dayArray[i+j].day}`, callback_data: `${dayArray[i+j].day}`}
            transferArray.push(transferObject)
        }
        btnArray.push(transferArray)
    }
    btnArray.push([{text: '<', callback_data: 'backmonth'}, {text: 'Назад', callback_data:'start'}, {text: '>', callback_data: 'nextmonth'} ])
    btn = {
        reply_markup: JSON.stringify( {
            inline_keyboard: btnArray
        })
    }
    return btn;
}


async function notecreator(chatid) {
    await bot.sendMessage(chatid, 'Введи название события')
    let listener = new Promise (async (resolve, reject)=>{
        bot.on('message', msg=>{
            if (chatid === msg.chat.id) {
                resolve(msg.text)
            }
        })
    }).then(async res=>{
        let mess = await bot.sendMessage(chatid, `Событие будет называться "${res}"?`, confirm)
        createChatDB(chatid, mess.message_id)
        listener = new Promise (async (resolve, reject)=>{
            bot.on('callback_query', msg=>{
                if (msg.message.chat.id === chatid) {
                    resolve(msg.data)
                }
            })
        }).then(res=>{
            if (res === 'confirmanswer') {
                deleteBotMessage(chatid)
                bot.sendMessage(chatid, 'Зафиксировал')
                let year = new Date().format('Y')
                let month = new Date().format('M')
                   let btn = monthBuilder(Number(month), Number(year))
                let mess = bot.sendMessage(chatid, 'Выбери день', btn)
                createChatDB(chatid, mess.message_id)
            }
            if (res === 'notconfirmanswer') {
                deleteBotMessage(chatid)
                notecreator(chatid)
            }
        })
    })
        
}

module.exports.fuck = fuck
module.exports.notecreator = notecreator
module.exports.monthBuilder = monthBuilder
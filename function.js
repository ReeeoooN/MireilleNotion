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
        dayArray[i] = dayObj
    }
    let btnArray = []
    let allMonth =['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    btnArray[0] = [{text: `${allMonth[month-1]} ${year}`, callback_data: ''}]
    btnArray[1] = [{text: 'Пн', callback_data: ''}, {text: 'Вт', callback_data: ''},
    {text: 'Ср', callback_data: ''}, {text: 'Чт', callback_data: ''},
    {text: 'Пт', callback_data: ''}, {text: 'Сб', callback_data: ''},
    {text: 'Вс', callback_data: ''}]
    let x =0;
    while(x!=diffInDays) {
        let weekArray = []
        for (j=x;j<x+7;j++){
            if (dayArray[j].weekday != j) {
                console.log(dayArray[j].weekday, j);
                weekArray[j] = {text: '', callback_data: ''}
            } else {
                weekArray[j] = {text: 'j', callback_data: 'j'}
                console.log(weekArray[j]);
            }
        }
        btnArray.push(weekArray)
        x=weekArray.length+1
    }
    console.log(btnArray);
        
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
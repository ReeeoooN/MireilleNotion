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
    if (Number(month) == 12) {
        nextmonth = 1
        nextyear = year++
    } else {
        nextmonth = Number(month)+1
    }
    const dateStart = new Date(`${nextyear}-${month}-1`); 
    const dateEnd = new Date(`${year}-${nextmonth}-1`);
    const oneDay = 1000 * 60 * 60 * 24; 
    const diffInTime = dateEnd.getTime() - dateStart.getTime();
    const diffInDays = Math.round(diffInTime / oneDay); 
    console.log(diffInDays);
    let dayArray = []
    for (i=0; i<diffInDays; i++) {
        let day = new Date (`${year}-${month}-${i+1}`)
        let dayObj = {
            day: i+1,
            weekday: day.getDay()
        }

        console.log(dayObj, i);
    }
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
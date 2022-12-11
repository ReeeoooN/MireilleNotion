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

function getNumberOfDays(start, end) { 
        const date1 = new Date(start); 
        const date2 = new Date(end); 
 
 // One day in milliseconds 
        const oneDay = 1000 * 60 * 60 * 24; 
 
 // Calculating the time difference between two dates 
        const diffInTime = date2.getTime() - date1.getTime(); 
 
 // Calculating the no. of days between two dates 
        const diffInDays = Math.round(diffInTime / oneDay); 
 
        return diffInDays;
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
                let thisYear = new Date().format("Y")
                let thisMount = new Date().format("M") - 1
                let nextMount
                if (thisMount == 12) {
                    nextMount = 1
                } else {
                    nextMount = thisMount + 1
                }
                let thisDay = new Date().format("d")
                let amount = getNumberOfDays(`${thisYear}-${thisMount}-${thisDay}`, `${thisYear}-${nextMount}-2`)
                let btnArray = []
                let arrayIndex = 0
                for (i=0; i<amount; i++) {
                    
                }
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
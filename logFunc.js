const fs = require('fs');
const { usersModel } = require('./bd');
const { bot, logBot } = require('./TelegramAPI');

async function logAdd(text) {
    let date = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear()
    let time = " " + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds()
    fs.appendFile(`logs/${date}.log`, date + time + ' '+ text + '\r\n', (err) => {
        if(err) throw err;
    }); 
    usersModel.findAll({where:{logon:true}}).then(users=>{
        for (let i = 0; i < users.length; i++) {
            logBot.sendMessage(users[i].id, `${date}${time} ${text}`)            
        }
    })
}

module.exports.logAdd = logAdd
const { phraseModel, notesModel, usersModel} = require("./bd");
const { adminbtn, back } = require("./botBtn");
const { logAdd } = require("./logFunc");
const { bot } = require("./TelegramAPI");

function fuck (chatid) {

    notesModel.findAll({where:{everyday:true}}).then(async res=>{
        for(i=0;i<res.length;i++){
            let noteDate = new Date (res[i].notedate)
            noteDate = new Date (noteDate).getTime()
            let dateNow = new Date()
            dateNow =new Date(dateNow).getTime()
            if (noteDate < dateNow) {
                noteDate = new Date (noteDate).setDate(new Date (noteDate).getDate()+1)
                notesModel.update({notedate: new Date (noteDate).format(`Y-M-d H:m`)}, {where:{id:res[i].id}})
            }
        }
        let mess = await bot.sendMessage(chatid, "done", back)
        await logAdd(`Restarting note`)
    })
}

async function sorrySend(chatid) {
    usersModel.findAll({raw:true}).then(async users =>{
        for(i=0;i<users.length;i++){
            bot.sendMessage(users[i].id, `Разбежавшись прыгнул со скалы... И сломался я. \n Сейчас я работаю, ежедневные уведомления, о которых я не уведомил, сработают завтра, сорри. Обычные уведомления можно отредактировать или удалить по кнопке "Мои уведомления"`)
        }
    })
    let mess = await bot.sendMessage(chatid, 'done', back)
    logAdd(`Send sorry`)
}

async function updateSend(chatid) {
    usersModel.findAll({raw:true}).then(async users =>{
        for(i=0;i<users.length;i++){
            let str = '';
            let userNotes = await notesModel.findAll({where:{chatid:users[i].id}, raw:true})
            for (j=0;j<userNotes.length;j++){
                if (userNotes[j].everyday = 1) {
                    str = str + `Ежедневное уведомление: "${userNotes[j].notename}", должен уведомить ${new Date (userNotes[j].notedate).format(`d.M.Y H:m`)}\n`
                } else { 
                    str = str + `Уведомление: "${userNotes[j].notename}", должен уведомить ${new Date (userNotes[j].notedate).format(`d.M.Y H:m`)}\n`
                }
            }
            bot.sendMessage(users[i].id, `Разработчик залез в мой код, временно могу не работать, сорри. Список уведомлений:\n ${str}`)
            str = '';
        }
    })
    let mess = await bot.sendMessage(chatid, 'done', back)
    logAdd(`Send update`)
}

async function phrase(chatid, type) {
    async function createPhrase(msg) {
        if (msg.chat.id == chatid){
            bot.removeListener('message', createPhrase)
            phraseModel.create({
                phrase: msg.text,
                type: type
            })
            bot.sendMessage(chatid, 'Complete', adminbtn)
        }
    }
    bot.on('message', createPhrase)
    let mess = await bot.sendMessage(chatid, 'Send')
    logAdd(`Create phrase ${type}`)
}

async function loging(chatid, type) {
    usersModel.update({logon:type}, {where:{id:chatid}})
    bot.sendMessage(chatid, 'done', back)
}

module.exports.loging = loging
module.exports.sorrySend = sorrySend
module.exports.updateSend = updateSend
module.exports.fuck = fuck
module.exports.phrase = phrase

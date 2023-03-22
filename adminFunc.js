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
        createChatDB(chatid, mess.message_id)
    })
}

async function sorrySend(chatid) {
    usersModel.findAll({raw:true}).then(async users =>{
        for(i=0;i<users.length;i++){
            bot.sendMessage(users[i].id, `Разбежавшись прыгнул со скалы... И сломался я. \n Сейчас я работаю, ежедневные уведомления, о которых я не уведомил, сработают завтра, сорри. Обычные уведомления можно отредактировать или удалить по кнопке "Мои уведомления"`)
        }
    })
    bot.sendMessage(chatid, 'done', back)
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
    bot.sendMessage(chatid, 'done', back)
}

module.exports.sorrySend = sorrySend
module.exports.updateSend = updateSend
module.exports.fuck = fuck
const { usersModel, friendshipModel } = require("./bd");

async function mainmenuBtnCreate(chatid) {
    let res = await usersModel.findOne({where:{id:chatid}})
    let btnArray = [[{text: 'Создать уведомление', callback_data: 'noteAdd'}]]
    if (res.coop == true) {
        let friendCheck = await friendshipModel.findOne({where:{chatid:chatid}})
        if (!friendCheck) {
            btnArray.push([{text: 'Мои уведомления', callback_data: 'myNote'}, {text: 'Дополнительно', callback_data: 'myinfo'}])
        } else {
            btnArray.push([{text: 'Друзья', callback_data: 'myFriends'}])
            btnArray.push([{text: 'Мои уведомления', callback_data: 'myNote'}, {text: 'Дополнительно', callback_data: 'myinfo'}])
        }
    }
    if (res.isadmin == true) {
        btnArray.push([{text: 'admin room', callback_data: 'adminmenu'}])
    }
    let btn = {
        reply_markup: JSON.stringify( {
            inline_keyboard: btnArray
        })
    } 
    return btn    
}

async function notePreCrBtn (note){
    let friendCheck = await friendshipModel.findOne({where:{chatid:note.chatid, confirm:true}})
    let btnArray = []
    console.log(note.type);
    if (note.type == 'simple') {
        btnArray.push([{text: '✅Обычное', callback_data: 'simplenote'}, {text: 'Ежедневное', callback_data: 'ednote'}, {text: 'Переодическое', callback_data: 'pernote'}])
    } else if (note.type == 'ed') {
        btnArray.push([{text: 'Обычное', callback_data: 'simplenote'}, {text: '✅Ежедневное', callback_data: 'ednote'}, {text: 'Переодическое', callback_data: 'pernote'}])
    } else if (note.type == 'period') {
        btnArray.push([{text: 'Обычное', callback_data: 'simplenote'}, {text: 'Ежедневное', callback_data: 'ednote'}, {text: '✅Переодическое', callback_data: 'pernote'}])
    } else if (note.type ==  null) {
        btnArray.push([{text: 'Обычное', callback_data: 'simplenote'}, {text: 'Ежедневное', callback_data: 'ednote'}, {text: 'Переодическое', callback_data: 'pernote'}])
    }
    if (!friendCheck) {
        if (note.type == null) {
            btnArray.push([{text: 'Назад', callback_data: 'start'}])
        } else {
            btnArray.push([{text: 'Готово', callback_data: 'notedone'}, {text: 'Назад', callback_data: 'start'}])
        }
    } else {
        if (note.coop == true) {
            btnArray.push([{text: 'Уведомление себе', callback_data: 'selfnote'}, {text: '✅Уведомление Другу', callback_data: 'friendnote'}])
        } else {
            btnArray.push([{text: '✅Уведомление себе', callback_data: 'selfnote'}, {text: 'Уведомление Другу', callback_data: 'friendnote'}])
        }
        if (note.type == null) {
            btnArray.push([{text: 'Назад', callback_data: 'start'}])
        } else {
            btnArray.push([{text: 'Готово', callback_data: 'notedone'}, {text: 'Назад', callback_data: 'start'}])
        }
    }
    let btn = {
        inline_keyboard: btnArray
    } 
    return btn 
}

async function periodBtn (period) {
    let btnArray = []
    if (period.type == null) {
        btnArray.push([{text: 'По дням недели', callback_data: 'perweek'}, {text: 'Раз в месяц', callback_data: 'permount'}], [{text: 'Раз в несколько дней', callback_data: 'perday'}], [{text: 'Назад', callback_data: 'perback'}])
    } else if (period.type == 'perweek') {
        if (period.data.mon == true) {
            btnArray.push([{text: '✅Понедельник', callback_data: 'monper'}])
        } else {
            btnArray.push([{text: 'Понедельник', callback_data: 'monper'}])
        }
        if (period.data.tue == true) {
            btnArray.push([{text: '✅Вторник', callback_data: 'tueper'}])
        } else {
            btnArray.push([{text: 'Вторник', callback_data: 'tueper'}])
        }
        if (period.data.wed == true) {
            btnArray.push([{text: '✅Среда', callback_data: 'wedper'}])
        } else {
            btnArray.push([{text: 'Среда', callback_data: 'wedper'}])
        }
        if (period.data.thu == true) {
            btnArray.push([{text: '✅Четверг', callback_data: 'thuper'}])
        } else {
            btnArray.push([{text: 'Четверг', callback_data: 'thuper'}])
        }
        if (period.data.fri == true) {
            btnArray.push([{text: '✅Пятница', callback_data: 'friper'}])
        } else {
            btnArray.push([{text: 'Пятница', callback_data: 'friper'}])
        }
        if (period.data.sat == true) {
            btnArray.push([{text: '✅Суббота', callback_data: 'satper'}])
        } else {
            btnArray.push([{text: 'Суббота', callback_data: 'satper'}])
        }
        if (period.data.sun == true) {
            btnArray.push([{text: '✅Воскресенье', callback_data: 'sunper'}])
        } else {
            btnArray.push([{text: 'Воскресенье', callback_data: 'sunper'}])
        }
        btnArray.push([{text: 'Готово', callback_data: 'perdone'}, {text: 'Назад', callback_data: 'backtoper'}])
    } else if (period.type == 'permount') {
        btnArray.push([{text: 'Готово', callback_data: 'perdone'}, {text: 'Назад', callback_data: 'backtoper'}])
    } else if (period.type == 'perday') {
        btnArray.push([{text: 'Готово', callback_data: 'perdone'}, {text: 'Назад', callback_data: 'backtoper'}])
    }
    let btn = {
        inline_keyboard: btnArray
    } 
    return btn
}

async function infoMenuBtnCreate (chatid) {
    let btn = [[{text: 'Сменить часовой пояс', callback_data: 'timediffEdit'}, {text: 'Задонатить', callback_data: 'donate'}]]
    let res = await usersModel.findOne({where:{id:chatid}})
    if (res.coop == false) {
        btn.push([{text: 'Включить совместный режим', callback_data: 'coopModeOn'}])
    } else {
        btn.push([{text: 'Выключить совместный режим', callback_data: 'coopModeOff'}])
    }
    btn.push([{text: 'Сменить имя', callback_data: 'changeName'}])
    if (res.repeaton == false) {
        btn.push([{text: 'Включить повтор уведомлений', callback_data: 'repeatModeOn'}])
    } else {
        btn.push([{text: 'Выключить повтор уведомлений', callback_data: 'repeatModeOff'}])
    }
    btn.push([{text: 'Назад', callback_data: 'start'}])
    btn = {
        reply_markup: JSON.stringify( {
            inline_keyboard: btn
        })
    } 
    return btn
}
adminbtn = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'restart notion', callback_data: 'noterest'}, {text: 'send sorry', callback_data: 'sorrysend'}, {text: 'send update', callback_data: 'updatesend'}],
            [{text: 'salutation create', callback_data: 'salutationphraseadd'}, {text: 'Send note text create', callback_data: 'sendnotetextadd'}], 
            [{text: 'log on', callback_data: 'logon'}, {text: 'log off', callback_data: 'logoff'}], 
            [{text: 'Назад', callback_data: 'start'}],
        ]
    })
}

taskBtn = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Я возьмусь', callback_data: 'taskadd'}],
            [{text: 'Выйти', callback_data: 'taskclose'}],
        ]
    })
}

repeatBtn = {
    inline_keyboard: [
        [{text: 'Понял', callback_data: ''}],
    ]
}
coopNote = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Обычное уведомление', callback_data: 'coopNoteAdd'}, {text: 'Ежедневное уведомление', callback_data: 'coopEdNote'}],
            [{text: 'Назад', callback_data: 'start'}],
        ]
    })
}

back = {
    reply_markup: JSON.stringify( {
        inline_keyboard: [
            [{text: 'Назад', callback_data: 'start'}],
        ]
    })
} 



eventRedBtn = {

    reply_markup: JSON.stringify( {
        inline_keyboard: [
            [{text: 'Редактировать дату/время', callback_data: 'redtime'}],
            [{text: 'Редактировать название', callback_data: 'redname'}],
            [{text: 'Редактировать параметры', callback_data: 'redparam'}],
            [{text: 'Назад', callback_data: 'start'}],
        ]
    })  

}

replyBack = {
    reply_markup: JSON.stringify( {
        keyboard: [
            [{text: 'Назад'}],
        ],
        resize_keyboard: true
    })
} 

confirmBtn = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Да', callback_data: 'confirmanswer'}, {text: 'Нет, назад', callback_data: 'nameback'}]
        ]
    })
}
getTime =  [
            [{text: '00', callback_data: '00'}, {text: '01', callback_data: '01'}, {text: '02', callback_data: '02'},
            {text: '03', callback_data: '03'}, {text: '04', callback_data: '04'}, {text: '05', callback_data: '05'}],
            [{text: '06', callback_data: '06'}, {text: '07', callback_data: '07'}, {text: '08', callback_data: '08'},
            {text: '09', callback_data: '09'}, {text: '10', callback_data: '10'}, {text: '11', callback_data: '11'}],
            [{text: '12', callback_data: '12'}, {text: '13', callback_data: '13'}, {text: '14', callback_data: '14'},
            {text: '15', callback_data: '15'}, {text: '16', callback_data: '16'}, {text: '17', callback_data: '17'}],
            [{text: '18', callback_data: '18'}, {text: '19', callback_data: '19'}, {text: '20', callback_data: '20'},
            {text: '21', callback_data: '21'}, {text: '22', callback_data: '22'}, {text: '23', callback_data: '23'}]
        ]


getHour =  [
            [{text: '00:00', callback_data: '00'}, {text: '01:00', callback_data: '01'}, {text: '02:00', callback_data: '02'},
            {text: '03:00', callback_data: '03'}, {text: '04:00', callback_data: '04'}, {text: '05:00', callback_data: '05'}, ],
            [{text: '06:00', callback_data: '06'}, {text: '07:00', callback_data: '07'}, {text: '08:00', callback_data: '08'},
            {text: '09:00', callback_data: '09'}, {text: '10:00', callback_data: '10'}, {text: '11:00', callback_data: '11'}],
            [{text: '12:00', callback_data: '12'}, {text: '13:00', callback_data: '13'}, {text: '14:00', callback_data: '14'},
            {text: '15:00', callback_data: '15'}, {text: '16:00', callback_data: '16'}, {text: '17:00', callback_data: '17'}],
            [{text: '18:00', callback_data: '18'}, {text: '19:00', callback_data: '19'}, {text: '20:00', callback_data: '20'},
            {text: '21:00', callback_data: '21'}, {text: '22:00', callback_data: '22'}, {text: '23:00', callback_data: '23'}],
            [{text: '<', callback_data: 'hourback'},{text: 'Назад', callback_data:'back'},{text: '>', callback_data: 'hournext'}]
        ]

getHourfored =  [
            [{text: '00:00', callback_data: '00'}, {text: '01:00', callback_data: '01'}, {text: '02:00', callback_data: '02'},
            {text: '03:00', callback_data: '03'}, {text: '04:00', callback_data: '04'}, {text: '05:00', callback_data: '05'}, ],
            [{text: '06:00', callback_data: '06'}, {text: '07:00', callback_data: '07'}, {text: '08:00', callback_data: '08'},
            {text: '09:00', callback_data: '09'}, {text: '10:00', callback_data: '10'}, {text: '11:00', callback_data: '11'}],
            [{text: '12:00', callback_data: '12'}, {text: '13:00', callback_data: '13'}, {text: '14:00', callback_data: '14'},
            {text: '15:00', callback_data: '15'}, {text: '16:00', callback_data: '16'}, {text: '17:00', callback_data: '17'}],
            [{text: '18:00', callback_data: '18'}, {text: '19:00', callback_data: '19'}, {text: '20:00', callback_data: '20'},
            {text: '21:00', callback_data: '21'}, {text: '22:00', callback_data: '22'}, {text: '23:00', callback_data: '23'}],
            [{text: 'Назад', callback_data:'start'}]
        ]

async function friendBtn(chatid) {
    let friendCheck = await friendshipModel.findOne({where:{chatid:chatid}})
    let subscribersCheck = await friendshipModel.findOne({where:{friendid:chatid}})
    let btn = []
    if (!friendCheck) {
        btn.push([{text: 'Добавить друга', callback_data: 'coopAddFriend'}])
    } else {
        btn.push([{text: 'Добавить друга', callback_data: 'coopAddFriend'}, {text: 'Удалить друга', callback_data: 'coopDelFriend'}])
    }
    if (!subscribersCheck) {
        btn.push([{text: 'Назад', callback_data: 'start'}])
    } else {
        btn.push([{text: 'Запретить присылать уведомления', callback_data: 'subscriberDel'}])
        btn.push([{text: 'Назад', callback_data: 'start'}])
    }
    btn = {
        reply_markup: JSON.stringify( {
            inline_keyboard: btn
        })
    } 
    return btn  
}

module.exports.eventRedBtn = eventRedBtn
module.exports.infoMenuBtnCreate = infoMenuBtnCreate
module.exports.getHour = getHour
module.exports.getHourfored = getHourfored
module.exports.back = back
module.exports.confirm = confirmBtn
module.exports.getTime = getTime
module.exports.replyBack = replyBack
module.exports.adminbtn = adminbtn
module.exports.mainmenuBtnCreate = mainmenuBtnCreate
module.exports.friendBtn = friendBtn
module.exports.coopNote = coopNote
module.exports.repeatBtn = repeatBtn
module.exports.notePreCrBtn =notePreCrBtn
module.exports.periodBtn =periodBtn
module.exports.taskBtn = taskBtn
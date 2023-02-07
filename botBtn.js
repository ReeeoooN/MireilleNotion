mainmenu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Создать уведомление', callback_data: 'noteAdd'}, {text: 'Ежедневное уведомление', callback_data: 'myEdNote'}],
            [{text: 'Мои уведомления', callback_data: 'myNote'}, {text: 'Дополнительно', callback_data: 'myinfo'}]
        ]
    })
}
infoMenu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Сменить часовой пояс', callback_data: 'timediffEdit'}, {text: 'Задонатить', callback_data: 'donate'}],
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

        inline_keyboard: [
            [{text: 'Редактировать дату/время', callback_data: 'redtime'}, {text: 'Редактировать название', callback_data: 'redname'}],
            [{text: 'Назад', callback_data: 'start'}],
        ]

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
            [{text: 'Да', callback_data: 'confirmanswer'}, {text: 'Нет, назад', callback_data: 'start'}]
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

module.exports.eventRedBtn = eventRedBtn
module.exports.infoMenu =infoMenu
module.exports.getHour = getHour
module.exports.getHourfored = getHourfored
module.exports.mainmenu = mainmenu
module.exports.back = back
module.exports.confirm = confirmBtn
module.exports.getTime = getTime
module.exports.replyBack = replyBack
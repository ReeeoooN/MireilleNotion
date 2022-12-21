mainmenu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Создать уведомление', callback_data: 'noteAdd'}, {text: 'Ежедневное уведомление', callback_data: 'myEdNote'}],
            [{text: 'Мои уведомления', callback_data: 'myNote'}, {text: 'Инфо', callback_data: 'myinfo'}]
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

confirmBtn = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Да', callback_data: 'confirmanswer'}, {text: 'Нет, назад', callback_data: 'start'}]
        ]
    })
}
getTime =  [
            [{text: '00:00-00:59', callback_data: '00'}, {text: '01:00-01:59', callback_data: '01'}, {text: '02:00-02:59', callback_data: '02'}],
            [{text: '03:00-03:59', callback_data: '03'}, {text: '04:00-04:59', callback_data: '04'}, {text: '05:00-05:59', callback_data: '05'}],
            [{text: '06:00-06:59', callback_data: '06'}, {text: '07:00-07:59', callback_data: '07'}, {text: '08:00-08:59', callback_data: '08'}],
            [{text: '09:00-09:59', callback_data: '09'}, {text: '10:00-10:59', callback_data: '10'}, {text: '11:00-11:59', callback_data: '11'}],
            [{text: '12:00-12:59', callback_data: '12'}, {text: '13:00-13:59', callback_data: '13'}, {text: '14:00-14:59', callback_data: '14'}],
            [{text: '15:00-15:59', callback_data: '15'}, {text: '16:00-16:59', callback_data: '16'}, {text: '17:00-17:59', callback_data: '17'}],
            [{text: '18:00-18:59', callback_data: '18'}, {text: '19:00-19:59', callback_data: '19'}, {text: '20:00-20:59', callback_data: '20'}],
            [{text: '21:00-21:59', callback_data: '21'}, {text: '22:00-22:59', callback_data: '22'}, {text: '23:00-23:59', callback_data: '23'}]
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

module.exports.infoMenu =infoMenu
module.exports.getHour = getHour
module.exports.mainmenu = mainmenu
module.exports.back = back
module.exports.confirm = confirmBtn
module.exports.getTime = getTime
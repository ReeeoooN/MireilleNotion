mainmenu = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Создать уведомление', callback_data: 'noteAdd'}, {text: 'Мои уведомления', callback_data: 'myNote'}]
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
            [{text: 'Да', callback_data: 'confirmanswer'}, {text: 'Нет', callback_data: 'notconfirmanswer'}, {text: 'Назад', callback_data: 'start'}]
        ]
    })
}

getHour = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: '00:00', callback_data: '00'}, {text: '01:00', callback_data: '01'}, {text: '02:00', callback_data: '02'},
            {text: '03:00', callback_data: '03'}, {text: '04:00', callback_data: '04'}, {text: '05:00', callback_data: '05'}, ],
            [{text: '06:00', callback_data: '06'}, {text: '07:00', callback_data: '07'}, {text: '08:00', callback_data: '08'},
            {text: '09:00', callback_data: '09'}, {text: '10:00', callback_data: '10'}, {text: '11:00', callback_data: '11'}],
            [{text: '12:00', callback_data: '12'}, {text: '13:00', callback_data: '13'}, {text: '14:00', callback_data: '14'},
            {text: '15:00', callback_data: '15'}, {text: '16:00', callback_data: '16'}, {text: '17:00', callback_data: '17'}],
            [{text: '18:00', callback_data: '18'}, {text: '19:00', callback_data: '19'}, {text: '20:00', callback_data: '20'},
            {text: '21:00', callback_data: '21'}, {text: '22:00', callback_data: '22'}, {text: '23:00', callback_data: '23'}],
            [{text: '<', callback_data: 'backhour'}, {text: 'Назад', callback_data:'start'}, {text: '>', callback_data: 'nexthour'} ]
        ]
    })
}



module.exports.getHour = getHour
module.exports.mainmenu = mainmenu
module.exports.back = back
module.exports.confirm = confirmBtn
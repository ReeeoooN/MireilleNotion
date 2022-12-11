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
            [{text: 'Да', callback_data: 'confirmanswer'}, {text: 'Нет', callback_data: 'notconfirmanswer'}]
        ]
    })
}

module.exports.mainmenu = mainmenu
module.exports.back = back
module.exports.confirm = confirmBtn
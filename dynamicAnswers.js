const { phraseModel, usersModel } = require("./bd");

async function phraseRand(type, chatid) {
    let res = await phraseModel.findAll({where:{type:type}, raw:true})
    let user = await usersModel.findOne({where:{id:chatid}})
    let phraseaArr = []
    for (let index = 0; index < res.length; index++) {
        phraseaArr.push(index)
    }     
    return res[phraseaArr[getRandomInt(phraseaArr.length)]].phrase.replace('%username%', user.name)

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

module.exports.phraseRand = phraseRand
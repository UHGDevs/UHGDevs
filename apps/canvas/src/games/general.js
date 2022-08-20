const func = require('../util/Functions')
const { f, fCtx, createCanvas, toDate } = require('../util/Functions')

exports.draw = (ctx, obj, api, gamemode) => {
    let stat = obj.stat 
    let color = obj.color || "#FFAA00", font = `${obj.size || 20}px ${obj.font || 'Minecraft'}`, text = api[stat] >= 0 ? api[stat] : api[gamemode][stat]

    if (obj.customText) {
        console.log(obj.customText.match(/%%(.*?)%%/gi))
    }

    // switch(stat) {
    //     case "level":
    //         break
    //     case "quests":
    //         text = `${f(api[stat])}/${f(api.challenges)}`
    //         break
    //     case "firstLogin":
    //         text = `${toDate(api.firstLogin)}`
    //         break
    //     case "lastLogin":
    //         text = `${toDate(api.lastLogin)}`
    //         break
    // }
     
    let options = {
        text: f(text),
        color: color,
        font: font
    }

    options.ctx =  fCtx(ctx, options)

    return createCanvas(options)
}

exports.position = () => {
    // to ce vyjde z drawGame se musí napozicovat (možná to číst z json souboru? kde to má být)
}

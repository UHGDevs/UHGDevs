const func = require('../util/Functions')
const { f, fCtx, createCanvas } = require('../util/Functions')

exports.draw = (ctx, stat, api, gamemode) => {
    let color = "#FFAA00", font = '20px Minecraft', text = api[stat] >= 0 ? api[stat] : api[gamemode][stat]

    switch(stat) {
        case "level":
            break
        case "quests":
            text = `${f(api[stat])}/${f(api.challenges)}`
            break
    }
     
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

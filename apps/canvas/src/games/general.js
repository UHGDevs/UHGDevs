const func = require('../util/Functions')
const fs = require('fs');
const { f, fCtx, createCanvas, toDate } = require('../util/Functions')
const {Canvas, loadImage, FontLibrary} = require('skia-canvas');

function draw (ctx, obj, api, gamemode) {
    let stat = obj.stat 
    let color = obj.color || "#FFAA00", font = `${obj.size || 20}px ${obj.font || 'Minecraft'}`, text = api[stat] >= 0 ? api[stat] : api[gamemode][stat]
    let customText = obj.customText

    if (customText) {
        customText.match(/%%(.*?)%%/gi).forEach(n => {
          let apiStat = api[n.replace(/%%/g, '')] ? api[n.replace(/%%/g, '')] : api[gamemode][n.replace(/%%/g, '')]
          customText = customText.replace(n, apiStat || n)
        })

        if (customText.includes('((')) {
            customText.match(/\(\((.*?)\(\(/gi).forEach(n => {
                let formatStat = func.toDate(n.replace(/\(\(/g, ''))
                customText = customText.replace(n, formatStat)
            })
        }
    text = customText
    }

    let options = { text: f(text), color: color, font: font }
    options.ctx =  fCtx(ctx, options)

    return createCanvas(options)
}

module.exports = async (ctx, api, data) => {
    let prefix = api.guild.tag ? `${api.hypixel.prefix} [${api.guild.tag}]` : api.hypixel.prefix

    for (let i of data.fields) {
        ctx = fCtx(ctx, i)
        let stat;
        if (!i.custom) stat = draw(ctx, i, api.hypixel, 'overall')
        else {
            if (i.stat === "skin") { let img = await loadImage(`https://visage.surgeplay.com/full/512/${api.hypixel.uuid}.png`); ctx.drawImage(img, i.x, i.y, 198, 320); continue}
            else if (i.stat === 'aps') {stat = func.displayText(ctx.measureText(""), ctx, "aps", api) }
            else if (i.stat === 'displayName') { stat = func.displayText(ctx.measureText(prefix), ctx, "name", api)}
        }

        if (!stat) continue

        ctx.drawImage(stat, i.x - stat.width/2, i.y)
    }

}

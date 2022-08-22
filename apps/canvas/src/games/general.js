const func = require('../util/Functions')
const fs = require('fs');
const { f, fCtx, toDate } = require('../util/Functions')
const {Canvas, loadImage, FontLibrary} = require('skia-canvas');

function draw (ctx, obj, api, gamemode) {
    let stat = obj.stat 
    let text = f(api[stat] >= 0 ? api[stat] : api[gamemode][stat])
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

    let color = ctx.fillStyle
    let font = ctx.font

    let dim = ctx.measureText(text)
    let canvas = new Canvas(dim.width || 300, dim.height || 40);
    ctx = canvas.getContext('2d')
    ctx.fillStyle = color
    ctx.font = font
    ctx.fillText(text, 0, 30)
    return canvas
}

module.exports = async (ctx, api, data) => {
    for (let i of data.fields) {
        let options = {
            color: i.color || data.default.color,
            size: i.size || data.default.size,
            font: i.font || data.default.font
        }

        ctx = fCtx(ctx, options)
        let stat;
        if (!i.custom) stat = draw(ctx, i, api.hypixel, 'overall')
        else {
            if (i.stat === "skin") { let img = await loadImage(`https://visage.surgeplay.com/full/512/${api.hypixel.uuid}.png`); ctx.drawImage(img, i.x, i.y, 198, 320); continue}
            else if (i.stat === 'aps') {stat = func.displayText(ctx, "aps", api, options) }
            else if (i.stat === 'displayName') { stat = func.displayText(ctx, "name", api, options)}
        }

        if (!stat) continue

        ctx.drawImage(stat, i.x - stat.width/2, i.y)
    }



}

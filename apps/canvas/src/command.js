const func = require('./util/Functions')
const fs = require('fs');
const { f, fCtx, toDate } = require('./util/Functions')
const {Canvas, loadImage, FontLibrary} = require('skia-canvas');

function draw (ctx, obj, api) { 
    let text = obj.customText ? null : f(func.path(obj.path + '/' + obj.stat, api))
    let customText = obj.customText

    if (customText) {
        customText.match(/%%(.*?)%%/gi).forEach(n => {
          let apiStat = func.path(n.replace(/%%/g, ''), api)
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

        i.path = i.path || 'hypixel'
        ctx = fCtx(ctx, options)
        let stat;
        if (!i.custom) stat = draw(ctx, i, api)
        else {
            if (i.stat === "skin") { let img = await loadImage(`https://visage.surgeplay.com/full/512/${api.hypixel.uuid}.png`); ctx.drawImage(img, i.x, i.y, 109, 177); continue}
            else if (i.stat === 'aps') {stat = func.displayText(ctx, "aps", api, options) }
            else if (i.stat === 'displayName') { stat = func.displayText(ctx, "name", api, options)}
        }

        if (!stat) continue

        ctx.drawImage(stat, i.x - stat.width/2, i.y)
    }



}

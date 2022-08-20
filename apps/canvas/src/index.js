const {Canvas, loadImage, FontLibrary} = require('skia-canvas');
const fs = require('fs');
const { f, fCtx } = require('./util/Functions')

async function run(mode = 'general', api = {}) {

   /* FONTS */
   FontLibrary.use("Minecraft", ['../canvas/src/fonts/MinecraftRegular-Bmg3.otf'])
   
   /* HANDLE API ERROR */
   if (!api.hypixel) {
      'return neplatne jmeno nebo jiny duvod'
      console.log(api.reason)
      return null
   }

   /* DEFINE BASIC HYPIXEL STATS */
   /* needs error handlering */
   let username = api.hypixel.username
   let prefix = api.guild.tag ? `${api.hypixel.prefix} [${api.guild.tag}]` : api.hypixel.prefix
   let rank = api.hypixel.rank

   /* define CANVAS */
   let canvas = new Canvas(800, 480);
   let ctx = fCtx(canvas.getContext("2d"), {});

   let background_name = mode
   
   if (mode == "general") {
      let files = ["general_1", "general_2", "general_3", "general_4"]
      background_name = files[Math.floor(Math.random()*files.length)]
   }

   /* STAT TO SHOW */
   let background = await loadImage(`../canvas/src/templates/${background_name}.png`)
   let img = await loadImage(`../canvas/src/templates/${mode}_command.png`)
   ctx.drawImage(background, 0, 0, 800, 480) // Background Image

   
   // TADY PRIDAT RUZNE HRY? (require(`./games/${mode}`))

   let cache = JSON.parse(fs.readFileSync(`../canvas/src/games/${mode}.json`, 'utf8'));

   ctx.drawImage(img, 0, 0, 800, 480) // Command Image

   // displayname
   let displayName = displayText(ctx.measureText(prefix), ctx, "name", api)
   ctx.drawImage(displayName, 234 + 275 - displayName.width/2, 10)

   // general example
   let skin = await loadImage(`https://visage.surgeplay.com/full/512/${api.hypixel.uuid}.png`)
   ctx.drawImage(skin, 20, 70, 198, 320)
   let game = drawGame(ctx, api, mode, 'overall', cache)

   for (let i of cache) {
      ctx.drawImage(game[i.stat], i.x - game[i.stat].width/2, i.y)
   }
   let aps = displayText(ctx.measureText(""), ctx, "aps", api)
   ctx.drawImage(aps, 694 - aps.width/2, 68)

   let toDiscord = await canvas.toBuffer()
   return {
      attachment: toDiscord,
      name: `${username}_${mode}.png`
   }
}

exports.run = run

// custom function for colored text - displayName with rank
function displayText(dim, oldctx, text, api) {
   let width = dim.width
   if (text == 'aps') {
      var a = '18px Minecraft', b = '15px Minecraft'
      oldctx.font = a
      width += oldctx.measureText(`${f(api.hypixel.aps)}`).width
      oldctx.font = b
      width += oldctx.measureText(` [Legacy ${f(api.hypixel.legacyAps)}]`).width
   }
   let canvas = new Canvas(width, 40);
   let ctx = fCtx(canvas.getContext('2d'), {color: api.hypixel.color})

   if (text == 'aps') {
      let x = 0, y = 30
      ctx.fillStyle = '#FFAA00'

      ctx.font = a
      ctx.fillText(`${f(api.hypixel.aps)}`, x, y)
      x += ctx.measureText(`${f(api.hypixel.aps)}`).width

      ctx.font = b
      ctx.fillText(` [Legacy ${f(api.hypixel.legacyAps)}]`, x, y)
      x += ctx.measureText(` [Legacy ${f(api.hypixel.legacyAps)}]`).width
   }
   else if (text == 'name') {
      let x = 0, y = 30
      let color = api.hypixel.color

      if (api.hypixel.rank.includes('MVP+')) {
         let plusColor = api.hypixel.color
         color = "#55ffff"
         if (api.hypixel.rank.includes('++')) color = "#fcba03"

         ctx.fillStyle = color
         ctx.fillText(`[MVP`, x, y)
         x += ctx.measureText(`[MVP`).width
         
         ctx.fillStyle = plusColor
         ctx.fillText(api.hypixel.rank.replace('MVP', ''), x, y)
         x += ctx.measureText(api.hypixel.rank.replace('MVP', '')).width

         ctx.fillStyle = color
         ctx.fillText(`] ${api.hypixel.username}`, x, y)
         x += ctx.measureText(`] ${api.hypixel.username}`).width
      } else {
         if (api.hypixel.rank == 'YOUTUBE') {
            ctx.fillStyle = color[0]
            ctx.fillText(`[`, x, y)
            x += ctx.measureText(`[`).width

            ctx.fillStyle = color[1]
            ctx.fillText(`YOUTUBE`, x, y)
            x += ctx.measureText(`YOUTUBE`).width

            ctx.fillStyle = color[0]
            ctx.fillText(`] ${api.hypixel.username}`, x, y)
            x += ctx.measureText(`] ${api.hypixel.username}`).width
         }
         else if (api.hypixel.rank == 'VIP+') {
            ctx.fillStyle = color
            ctx.fillText(`[VIP`, x, y)
            x += ctx.measureText(`[VIP`).width

            ctx.fillStyle = '#FFAA00'
            ctx.fillText(`+`, x, y)
            x += ctx.measureText(`+`).width

            ctx.fillStyle = color
            ctx.fillText(`] ${api.hypixel.username}`, x, y)
            x += ctx.measureText(`] ${api.hypixel.username}`).width
         }
         else {
            ctx.fillText(api.hypixel.prefix, x, y)
            x += ctx.measureText(api.hypixel.prefix).width
         }
      }
      if (api.guild.tag) {
         ctx.fillStyle = api.guild.color
         ctx.fillText(` [${api.guild.tag}]`, x, y)
      }
   }
   return canvas
}

// example of possible method of displaying minigames
function drawGame(ctx, api, game, gamemode, settings = []) {
   let result = {}
   for (let obj of settings) {
      let stat = obj.stat 
      let fApi = api.hypixel.stats[game] || api.hypixel
   

      let res = require(`./games/${game}`).draw(ctx, obj, fApi, gamemode)
      result[stat] = res //createCanvas({ text: f(text), ctx: ctx, color: color, font: font })
   }

   return result
}
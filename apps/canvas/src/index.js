
const {Canvas, loadImage, FontLibrary} = require('skia-canvas');

async function run(mode = 'profile', api = {}) {

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
   let prefix = api.hypixel.prefix
   let rank = api.hypixel.rank
   let color = api.hypixel.color

   /* define CANVAS */
   let canvas = new Canvas(805, 540);
   let ctx = canvas.getContext("2d");
   ctx = fCtx(ctx, {})

   /* STAT TO SHOW */
   let img = await loadImage(`../canvas/src/templates/${mode}.png`)
   ctx.drawImage(img, 0, 0, 805, 540) // mozna pak udělat jine velikosti?

   let dim = ctx.measureText(prefix)
   let displayName = new Canvas(dim.width, 40);
   let ctx2 = fCtx(displayName.getContext('2d'), {color: color})

   if (rank.includes('MVP+')) {
      let plusColor = color
      color = "#55ffff"
      if (rank.includes('++')) color = "#fcba03"
      let x = 0, y = 30

      ctx2.fillStyle = color
      ctx2.fillText(`[MVP`, x, y) /* ! THE WHITESPACE IS A SPECIAL CHARACTER, NOT A CLASSIC SPACE, DO NOT REMOVE IT ! */ //kam zmizela?
      x += ctx2.measureText(`[MVP`).width
      
      ctx2.fillStyle = plusColor
      ctx2.fillText(rank.replace('MVP', ''), x, y)
      x += ctx2.measureText(rank.replace('MVP', '')).width

      ctx2.fillStyle = color
      ctx2.fillText(`] ${username}`, x, y)
   } else ctx2.fillText(prefix, 0, 30)
   ctx.drawImage(displayName, 150 + 320 - dim.width/2, 43 - 30)
  

   //await canvas.saveAs(`../canvas/src//results/${username}_${mode}.png`)
   let toDiscord = await canvas.toBuffer()
   return {
      attachment: toDiscord,
      name: `${username}_${mode}.png`
   }
   // Also to username_mode pak budem jeste menit
}

function fCtx(ctx, options = {}) {
   ctx.font = options.font || '30px Minecraft'
   ctx.fillStyle = options.fillStyle || options.color || ''


   return ctx
}

exports.run = run
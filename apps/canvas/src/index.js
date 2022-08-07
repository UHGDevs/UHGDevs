
const {Canvas, loadImage, FontLibrary} = require('skia-canvas');

async function run(mode = 'profile', api = {}) {
   let canvas = new Canvas(805, 540);
   let ctx = canvas.getContext("2d");

   /* FONTS */
   FontLibrary.use("Minecraft", ['../canvas/src/fonts/MinecraftRegular-Bmg3.otf'])
   //FontLibrary.use(["../canvas/src/fonts/"])

   /* HANDLE API ERROR */
   if (!api.success) {
      'return neplatne jmeno nebo jiny duvod'
      console.log(api.reason)
      return null
   }

   /* DEFINE BASIC HYPIXEL STATS */
   /* needs error handlering */
   let username = api.hypixel.username
   let prefix = api.hypixel.prefix
   let rank = api.hypixel.rank
   let rankcolor = api.hypixel.color

   let usernamecolor = "#fcba03"

   /* STAT TO SHOW */
   let img = await loadImage(`../canvas/src/templates/${mode}.png`)
   ctx.drawImage(img, 0, 0, 805, 540) // mozna pak udělat jine velikosti?

   
   // TADY potom ten text, který jeste nevíme jak (musí se rozdělit podle gamemodu)
   //ctx.textAlign = 'center'
   ctx.font = '30px Minecraft'
   ctx.fillStyle = usernamecolor
   if (rank == "MVP+") {
      let x = 150+320, y = 43
      ctx.fillText(`[MVP`, x, y) /* ! THE WHITESPACE IS A SPECIAL CHARACTER, NOT A CLASSIC SPACE, DO NOT REMOVE IT ! */
      x += ctx.measureText(`[MVP`).width
      
      ctx.fillStyle = "#ffffff"
      ctx.fillText(`+`, x, y)
      x += ctx.measureText(`+`).width

      ctx.fillStyle = usernamecolor
      ctx.fillText(`] ${username}`, x, y)
   }
   else ctx.fillText(prefix, 150 + 320, 43)

   //await canvas.saveAs(`../canvas/src//results/${username}_${mode}.png`)
   let toDiscord = await canvas.toBuffer()
   return {
      attachment: toDiscord,
      name: `${username}_${mode}.png`
   }
   // Also to username_mode pak budem jeste menit
}

exports.run = run
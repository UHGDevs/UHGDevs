const {Canvas, loadImage, FontLibrary} = require('skia-canvas');
const { f, fCtx } = require('./util/Functions')

/* FONTS -> */ FontLibrary.use("Minecraft", ['../canvas/src/fonts/MinecraftRegular-Bmg3.otf'])

async function run(data, api = {}) {
   /* HANDLE API ERROR -> */ if (!api.hypixel) { return api.reason }

   let mode = data._id
   if (!mode){ console.log('Chybí definovat hru'); console.log(data); return}

   /* define CANVAS */
   let canvas = new Canvas(data.width, data.height);
   let ctx = fCtx(canvas.getContext("2d"), {});

   let background_name = mode

   if (mode == "general") {
      let files = ["general_1", "general_2", "general_3", "general_4"]
      background_name = files[Math.floor(Math.random()*files.length)]
   }

   let background = await loadImage(`../canvas/src/templates/${background_name||'general_1'}.png`)
   let img = await loadImage(`../canvas/src/templates/${mode}_command.png`)

   ctx.drawImage(background, 0, 0, 800, 480) // Background Image
   ctx.drawImage(img, 0, 0, 800, 480) // Command Image


   await require(`./games/general`)(ctx, api, data)


   let toDiscord = await canvas.toBuffer()

   return {
      attachment: toDiscord,
      name: `${api.username}_${mode}.png`
   }
}

exports.run = run
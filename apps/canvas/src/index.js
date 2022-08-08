
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

   const stats = {
      profile: {
         displayName: displayNameF
      },
      bedwars: drawBedwars
   }

   /* DEFINE BASIC HYPIXEL STATS */
   /* needs error handlering */
   let username = api.hypixel.username
   let prefix = api.hypixel.prefix
   let rank = api.hypixel.rank
   let color = api.hypixel.color

   /* define CANVAS */
   let canvas = new Canvas(805, 540);
   let ctx = fCtx(canvas.getContext("2d"), {});

   /* STAT TO SHOW */
   let img = await loadImage(`../canvas/src/templates/${mode}.png`)
   ctx.drawImage(img, 0, 0, 805, 540) // mozna pak udělat jine velikosti?

   // displayname
   let displayName = stats.profile.displayName(api, ctx.measureText(prefix))
   ctx.drawImage(displayName, 150 + 320 - displayName.width/2, 43 - 30)

   // bw example
   let bw = stats.bedwars(api, ctx, ['level', 'finalKills'])
   ctx.drawImage(bw.level, 200 - bw.level.width/2, 170 ) // zatím jen test čísla, nemám to naměřené (a navíc bw LOL)
   ctx.drawImage(bw.finalKills, 600 - bw.finalKills.width/2, 170 )
  

   //await canvas.saveAs(`../canvas/src//results/${username}_${mode}.png`)
   let toDiscord = await canvas.toBuffer()
   return {
      attachment: toDiscord,
      name: `${username}_${mode}.png`
   }
   // Also to username_mode pak budem jeste menit
}

// define ctx with formating
function fCtx(ctx, options = {}) {
   ctx.font = options.font || '30px Minecraft'
   ctx.fillStyle = options.fillStyle || options.color || ''

   return ctx
}

exports.run = run

// basic text - without color changes - example viz drawBedwars
function createCanvas(options) {
   let dim = options.text ? options.preview.measureText(options.text) : {} 
   if (!dim) return {}
   let canvas = new Canvas(dim.width || 300, dim.height || 40);

   let ctx = fCtx(canvas.getContext('2d'), {color: options.color || '#aaaaaa'})
   ctx.fillText(options.text, 0, 30)
   return canvas
}

// custom function for colored text - displayName with rank
function displayNameF(api, dim) {
   let canvas = new Canvas(dim.width, 40);
   let ctx = fCtx(canvas.getContext('2d'), {color: api.hypixel.color})

   if (api.hypixel.rank.includes('MVP+')) {
      let plusColor = api.hypixel.color
      color = "#55ffff"
      if (api.hypixel.rank.includes('++')) color = "#fcba03"
      let x = 0, y = 30

      ctx.fillStyle = color
      ctx.fillText(`[MVP`, x, y)
      x += ctx.measureText(`[MVP`).width
      
      ctx.fillStyle = plusColor
      ctx.fillText(api.hypixel.rank.replace('MVP', ''), x, y)
      x += ctx.measureText(api.hypixel.rank.replace('MVP', '')).width

      ctx.fillStyle = color
      ctx.fillText(`] ${api.hypixel.username}`, x, y)
   } else ctx.fillText(api.hypixel.prefix, 0, 30)
   return canvas
}

// example of possible method of displaying minigames
function drawBedwars(api, preview, req = ['level', 'finalKills']) {
   let result = {}
   for (let stat of req) {
      let fStat = stat == 'level' ? 'levelformatted' : stat
      
      let bwApi = api.hypixel.stats.bedwars

      let gamemode = 'overall' // need this to be fixed
      let text = bwApi[fStat] ? bwApi[fStat] : bwApi[gamemode][fStat]

      result[stat] = createCanvas({ text: text, preview: preview, color: null, font: null })
   }

   return result
}
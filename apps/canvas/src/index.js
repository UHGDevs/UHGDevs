
const {Canvas, loadImage, FontLibrary} = require('skia-canvas');

async function run(mode = 'profile', api = {}) {
  let canvas = new Canvas(805, 540);
  let ctx = canvas.getContext("2d");
  FontLibrary.use("Minecraft", ['../canvas/src/fonts/MinecraftRegular-Bmg3.otf'])
  //FontLibrary.use(["../canvas/src/fonts/"])

  let username = api.username
  let rank = '[' + api.rank + ']'

  let profile = api.prefix
  
  let usernamecolor = "#fcba03"

  let img = await loadImage('../canvas/src/templates/profile.png')
  ctx.drawImage(img, 0, 0, 805, 540)

  ctx.font = '30px Minecraft'
  ctx.fillStyle = usernamecolor
  ctx.textAlign = 'center'
  ctx.fillText(profile, 150 + 320, 43)
  
  await canvas.saveAs(`../canvas/src//results/${username}.png`)
  let toDiscord = await canvas.toBuffer()
  return {
   attachment: toDiscord,
   name: `${username}_profile.png`
}
}

exports.run = run
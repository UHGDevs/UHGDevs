const squid = require('flying-squid');
const mineflayer = require("mineflayer");

module.exports = (uhg) => {
  let force = false
  if (uhg.settings.minecraft === true) {
    if (uhg.settings.dev_mode === true && force) {
      uhg.mc.client = mineflayer.createBot({
        host: "mc.hypixel.net",
        port: "25565",
        username: process.env.email,
        password: process.env.password,
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 10,
        profilesFolder: 'src/settings/minecraft/',
        auth: "microsoft",
        version: "1.8.9",
        viewDistance: "tiny",
        chatLengthLimit: 256,
        skipValidation: true 
      })
      
    } else {

      uhg.mc.client = mineflayer.createBot({
        host: "mc.hypixel.net",
        port: "25565",
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 10,
        profilesFolder: 'src/settings/minecraft/',
        auth: "microsoft",
        version: "1.8.9",
        viewDistance: "tiny",
        chatLengthLimit: 256,
        skipValidation: true 
      })
    }

    uhg.mc.client.setMaxListeners(Infinity)

    uhg.mc.client.on("login", (packet) => {
      console.log("BOT LOG ON".brightGreen)  
      uhg.mc.send.push({send: `/limbo`, onetime:true})
    })


    async function msaCode(data) {
      console.log(data)
      const msg = `Nové přihlášení:\nLink: ${data?.verification_uri}\nKód: \`${data?.user_code}\``
      console.log(msg)
      let channel = uhg.dc.cache.channels.get('bot')
      if (!channel) return

      channel.send(msg).then(n => { setTimeout(() => n.delete(), data.expires_in * 100) }).catch()

    }

  } else if (uhg.settings.test === true && uhg.settings.minecraft !== true) {

    uhg.test.server = squid.createMCServer({ port: 25565, 'max-players': 10, 'online-mode': false, gameMode: 1, difficulty: 1, plugins: {}, 'view-distance': 2, version: '1.16.1', })

    uhg.mc.client = mineflayer.createBot({
      host: "localhost",
      port: "25565",
      username: "Technoblade",
      version: "1.16.1"
    })

  }

}

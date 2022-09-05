const minecraft = require('minecraft-protocol');
const squid = require('flying-squid');

module.exports = (uhg) => {
  if (uhg.settings.minecraft === true) {
    if (uhg.settings.dev_mode === true) {
      uhg.mc.client = minecraft.createClient({
        host: "mc.hypixel.net",
        username: process.env.email,
        password: process.env.password,
        auth: 'microsoft',
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 4,
        profilesFolder: 'src/settings/minecraft/'
      })
    } else {
      uhg.mc.client = minecraft.createClient({
        host: "mc.hypixel.net",
        version: "1.16.1",
        username: process.env.email,
        auth: 'microsoft',
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 4,
        profilesFolder: 'src/settings/minecraft/'
      })
    }

    uhg.mc.client.setMaxListeners(Infinity)

//     uhg.mc.client.on("success", (packet, a) => {
// //      console.log(packet)
// //      console.log(a)
//       console.log("BOT LOG ON".brightGreen)
//     })

    async function msaCode(data) {
      console.log(data)
      const msg = `Nové přihlášení:\nLink: ${data.verification_uri}\nKód: \`${data.user_code}\``

      let channel = uhg.dc.cache.channels.get('bot')
      if (!channel) return

      channel.send(msg).then(n => { setTimeout(() => n.delete(), data.expires_in * 100) }).catch()

    }

  } else if (uhg.settings.test === true && uhg.settings.minecraft !== true) {

    uhg.test.server = squid.createMCServer({ port: 25565, 'max-players': 10, 'online-mode': false, gameMode: 1, difficulty: 1, plugins: {}, 'view-distance': 2, version: '1.16.1', })

    uhg.mc.client = minecraft.createClient({
     host: "localhost",
     port: 25565,
     username: "Technoblade",
     version: "1.16.1"
    })

  }
}

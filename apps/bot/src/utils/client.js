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
        onMsaCode: msaCode
      })
    } else {
      uhg.mc.client = minecraft.createClient({
        host: "mc.hypixel.net",
        username: process.env.email,
        auth: 'microsoft',
        onMsaCode: msaCode
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

    uhg.test.server = squid.createMCServer({
        motd: 'A Minecraft Server \nRunning flying-squid',
        port: 25565,
        'max-players': 10,
        'online-mode': false,
        logging: false,
        gameMode: 1,
        difficulty: 1,
        worldFolder: undefined,
        generation: {
           name: 'superflat',
           options: {
              worldHeight: 80
           },
        },
        kickTimeout: 10000,
        plugins: {},
        modpe: false,
        'view-distance': 2,
        'player-list-text': {
           header: { text: 'aaaaaaaa' },
           footer: { text: 'Test server' },
        },
        'everybody-op': true,
        'max-entities': 10,
        version: '1.16.1',
     })

    uhg.mc.client = minecraft.createClient({
     host: "localhost",
     port: 25565,
     username: "Technoblade",
     version: "1.16.1"
    })

  }
}

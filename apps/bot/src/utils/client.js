const minecraft = require('minecraft-protocol');
const squid = require('flying-squid');
const mineflayer = require("mineflayer");

module.exports = (uhg) => {
  let force = false
  if (uhg.settings.minecraft === true) {
    if (uhg.settings.dev_mode === true && force) {

      /*
      uhg.mc.client = minecraft.createClient({
        host: "mc.hypixel.net",
        version: "1.20.1",
        port: "25565",
        username: process.env.email,
        password: process.env.password,
        auth: 'microsoft',
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 1.5,
        profilesFolder: 'src/settings/minecraft/'
      })
        */

      uhg.mc.client = mineflayer.createBot({
        host: "mc.hypixel.net",
        port: "25565",
        username: process.env.email,
        password: process.env.password,
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 1.5,
        profilesFolder: 'src/settings/minecraft/',
        auth: "microsoft",
        version: "1.8.9",
        viewDistance: "tiny",
        chatLengthLimit: 256,
      })

    } else {

      uhg.mc.client = mineflayer.createBot({
        host: "mc.hypixel.net",
        port: "25565",
        username: process.env.email,
        checkTimeoutInterval: 30 * 1000 * 10,
        profilesFolder: 'src/settings/minecraft/',
        auth: "microsoft",
        version: "1.8.9",
        viewDistance: "tiny",
        chatLengthLimit: 256,
      })
      /*
      uhg.mc.client = minecraft.createClient({
        version: '1.20.1',
        host: "mc.hypixel.net",
        port: "25565",
        username: process.env.email,
        auth: 'microsoft',
        onMsaCode: msaCode,
        checkTimeoutInterval: 30 * 1000 * 1.5,
        profilesFolder: 'src/settings/minecraft/'
      })
        */
    }

    uhg.mc.client.setMaxListeners(Infinity)

    /*
     uhg.mc.client.on("success", (packet, a) => {
//       console.log(packet)
//       console.log(a)
       console.log("BOT LOG ON".brightGreen)
     })
*/
      uhg.mc.client.on("login", (packet, a) => {
         console.log("BOT LOG ON".brightGreen)
       })

       //uhg.mc.client.on("login", (...args) => this.onLogin(...args));
       //uhg.mc.client.on("end", (...args) => this.onEnd(...args));
       //uhg.mc.client.on("kicked", (...args) => this.onKicked(...args));


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

    /*
    uhg.mc.client = minecraft.createClient({
     host: "localhost",
     port: 25565,
     username: "Technoblade",
     version: "1.16.1"
    })
    */

    uhg.mc.client = mineflayer.createBot({
      host: "localhost",
      port: "25565",
      username: "Technoblade",
      version: "1.16.1"
    })

  }

}

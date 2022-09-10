const fs = require('fs');
const hypixie = require("hypixie");
module.exports = {
  name: "version",
  aliases: ["verze"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      

      await uhg.delay(500)
      console.time('API')
      await hypixie("player", {
        uuid: "56da43a4-088d-4a76-82b6-dd431535015e",
        key: process.env.api_key
    });
      console.timeEnd('API')

      console.time('oldTIME')
      await uhg.api.call('DavidCzPdy', ['hypixel'])
      console.timeEnd('oldTIME')
      
      let config = require('../../../package.json')
      return `Verze bota je ${config.version}`
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v version příkazu!"
    }
  }
}

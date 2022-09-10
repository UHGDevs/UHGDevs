const fs = require('fs');

let hypixel = require('hypixel-api-nodejs')
module.exports = {
  name: "version",
  aliases: ["verze"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      

      await uhg.delay(500)
      console.time('API')
      await hypixel.getKeyInformations(process.env.api_key);
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

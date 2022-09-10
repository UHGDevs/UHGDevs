const fs = require('fs');
const hyp = require('hypixel.ts');
module.exports = {
  name: "version",
  aliases: ["verze"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      const client = new hyp.Client(process.env.api_key);
      await uhg.delay(500)
      console.time('API')
      let player = await client.players.fetch('DavidCzPdy')
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

const fs = require('fs');

let hypixel = require('hypixel-api-nodejs')
module.exports = {
  name: "version",
  aliases: ["verze"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      let config = require('../../../package.json')
      return `Verze bota je ${config.version}`
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v version příkazu!"
    }
  }
}

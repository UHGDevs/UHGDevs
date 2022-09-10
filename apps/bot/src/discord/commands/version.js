const fs = require('fs');

const axios = require('axios');
const https = require('https')
const httpsAgent = new https.Agent({ keepAlive: true });
const instance = axios.create({
  baseURL: 'https://api.hypixel.net/',
  httpsAgent,
})
module.exports = {
  name: "version",
  aliases: ["verze"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      
      console.time('API')
      console.log(httpsAgent)
      await instance.get('player', {params: { key: process.env.api_key, uuid: 'f50e5d5cca524c2ebc9d040acefa7c5a' }})
     
     console.timeEnd('API')

      let config = require('../../../package.json')
      return `Verze bota je ${config.version}`
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v version příkazu!"
    }
  }
}

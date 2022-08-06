const time = require('../../utils/timehandler.js')
const aps = require('../../utils/achievements.js')
const axios = require('axios');
const fs = require('fs');

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Automatické aktualizování achievementů",
  emoji: '💎',
  time: '0 0 * * * *', //'*/10 * * * * *'
  ignore: '* * 0,23 * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg) => {
    let date = new Date()
    let event = time.start(uhg, eventName)
    try {
        let api = await axios.get('https://api.hypixel.net/resources/achievements')
        let json = JSON.parse(fs.readFileSync('src/settings/values/achievements.json', 'utf8'))
        fs.writeFileSync('src/settings/values/achievements.json', JSON.stringify({all: api.data.achievements, legacy: await aps.getLegacy(uhg, api.data.achievements)}, null, 4))
    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}

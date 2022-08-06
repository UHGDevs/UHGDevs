const time = require('../../utils/timehandler.js')

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Automatická aktualizace databáze",
  emoji: '💻',
  time: '0 */5 * * * *', //'*/10 * * * * *'
  ignore: '* * 0,23 * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: false,
  run: async (uhg) => {
    let now = Number(new Date())
    let event = time.start(uhg, eventName)
    try {
      let data = await uhg.mongo.run.get("stats", "stats")
      uhg.data.stats = data
      //console.log(data)
      data = data.filter(n => n.updated<=now-1000*60*60).sort((a, b) => a.updated - b.updated)//n.updated<=now-n.delay ||43000000
      let update = data.slice(0,50)
      update.forEach(async (member) => {
        let api = await uhg.getApi(member.uuid, ["hypixel"])
        if (api instanceof Object == false) return;
        await uhg.mongo.run.update("stats", "stats", {_id: api.uuid}, api.hypixel)
      });
      //await uhg.delay(5000)
      //uhg.time.ready.database = true

    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}

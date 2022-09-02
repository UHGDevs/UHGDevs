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
      let data = await uhg.mongo.run.get("stats", "stats").then(n => n.sort((a, b) => a.updated - b.updated))
      uhg.data.stats = data
      let verify = await uhg.mongo.run.get('general', 'verify', {})
      uhg.data.verify = verify
      data = data.filter(n => n.updated<=now-1000*60*60).sort((a, b) => a.updated - b.updated)//n.updated<=now-n.delay ||43000000
      let update = data.slice(0,50)
      for (let member of update) {
        let api = await uhg.api.call(member.uuid, ["hypixel"])
        if (!api.success) return uhg.dc.client.channels.cache.get('548772550386253824').send(`${member.username} database refresh error:\n${api.reason}`)
        let ver = verify.find(a => a.uuid == api.uuid)
        if (ver && (ver.nickname !== api.username || !Array.isArray(ver.names) ||ver.names.length !== api.names.length || ver.textures?.raw?.value !== api.textures.raw.value || !ver.date)) uhg.mongo.run.update("general", "verify", {_id: ver._id}, { uuid: ver.uuid, nickname: api.username, names: api.names, textures: api.textures, date: api.date })
        await uhg.mongo.run.update("stats", "stats", {_id: api.uuid}, api.hypixel)
        await uhg.delay(300)
      };
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

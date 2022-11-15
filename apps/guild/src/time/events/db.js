
const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

let updateMembers = 50

module.exports = {
  name: eventName,
  description: "Aktualizování databáze",
  emoji: '💻',
  time: '0 */10 * * * *', //'*/10 * * * * *'
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg, options) => {

    if (!uhg.redis) throw 'Není připojená redis DB'


    let keys = await uhg.getRedisKeys()

    let request = await uhg.redis_get('f50e5d5cca524c2ebc9d040acefa7c5a', '.')

    let update = request.data.filter(n => n && n.stats && n.stats.updated).sort((a, b) => a.stats.updated - b.stats.updated).slice(0, updateMembers)
    for (let data of update) {
        let uuid = data.uuid

        let api = await uhg.api.call(uuid, ['hypixel'])
        if (!api.success) {
            console.log(api)
            continue;
        }

        if (api.textures?.skin.data !== data.skin.skin.data) await uhg.redis_post(uuid, api.textures, '.skin')
        if (api.names?.length !== data.names?.length) await uhg.redis_post(uuid, api.names, '.names')
        if (data.username !== api.username) await uhg.redis_post(uuid, api.username,'.username')

        let hypixel = api.hypixel;
        ['_id'].forEach(e => delete hypixel[e]);
        await uhg.redis_post(uuid, hypixel, '.stats')

    }

  }
}
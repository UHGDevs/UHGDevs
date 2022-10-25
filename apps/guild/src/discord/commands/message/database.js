const { Collection } = require("discord.js");

module.exports = {
    name: "database",
    aliases: ['db'],
    permissions: [{ id: '312861502073995265', type: 'USER', permission: true }, { id: '378928808989949964', type: 'USER', permission: true }, { id: '419183469911080960', type: 'USER', permission: true }],
    platform: "dc",
    type: "message",
    run: async (uhg, message, content) => {
        message.delete()
        if (!uhg.redis) return 'Není zaplá redis databáze!'
        let keys = await uhg.redis.keys('*')

        console.timer('a')
        let stats = await Promise.all(keys.map(async (key) => await uhg.redis.json.get(key, { path: '.'}).catch(e => {})))
        console.log(stats.length)
        console.timeEnd('a')

        // if (!uhg.stats) {
        //     let staty = await uhg.get('stats', 'stats', { /*username: 'DavidCzPdy'*/})
        //     uhg.stats = staty
        // }
        // console.log('stats loaded')

        // //stats = stats.filter(n => !keys.includes(n)).slice(0, 99)

        // for (let stats of uhg.stats.filter(n => (n => !keys.includes(n.uuid)))/*.slice(0, 50)*/) {
        //     let uuid = stats.uuid

        //     const verify = await uhg.get("general", "verify", {uuid: uuid})


        //     let user = {id: verify[0]?._id || undefined, uuid: uuid, username: verify[0]?.nickname || stats.nickname, skin: verify[0]?.textures || undefined, stats: stats, notifiers: {}, guild: {}, lootboxes: {}, events: {}}
            
        //     await uhg.redis.json.set(user.uuid, '.', user)
        // }
        console.warn('not done yet!')
    }
}


const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
    name: eventName,
    description: "Updated CHANNEL INFO",
    emoji: 'ℹ️',
    time: '0 */2 * * * *', //'*/10 * * * * *'
    ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
    onstart: false,
    run: async (uhg, options) => {

        let data = {}

        for (let db of ['uhg', 'tkjk']) {
            data[db] = {}

            let guild = await uhg.api.call(db == 'uhg' ? '64680ee95aeb48ce80eb7aa8626016c7' : '574bfb977d4c475b8197b73b15194a2a', ['guild'])
            if (!guild.success) continue;
            guild = guild.guild?.guild
            if (guild.name !== 'UltimateHypixelGuild' && guild.name !== 'TKJK') continue;

            let info = data[db]

            info.members = guild.members.length
            info.exp = guild.exp
            info.level = gl(guild.exp)
            info.weekly = guild.members.reduce((total, player) => Object.values(player.expHistory).reduce((exp, day) => day + exp, 0) + total, 0)
        }

        const getChannel = (id) => dc_client.channels.cache.get(id)
        const renameChannel = async (id, name) => (getChannel(id)?.name == name) ? null : await (getChannel(id)?.setName(name))

        // MEMBERS
        if (getChannel('811865691908603904')?.name !== 'Members: 125/125' && data.uhg?.members === 125  ) {}


        /* UHG INFO */
        if (data.uhg.members) await renameChannel('811865691908603904', `Members: ${data.uhg.members}/125`)
        if (data.uhg.level) await renameChannel('825659339028955196', `Guild Level: ${f(data.uhg.level)}`)

        if (data.uhg.level && data.tkjk.level) await renameChannel('928671490436648980', `Rozdíl: ${f(data.tkjk.level - data.uhg.level, 5)}`)

        /* TKJK INFO */
        if (data.tkjk.level) await renameChannel('928569528676392980', `TKJK: ${f(data.tkjk.level)}`)

    }
}
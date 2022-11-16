
const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Aktualizování GUILD databáze",
  emoji: '🛞',
  time: '0 */10 * * * *', //'*/10 * * * * *'
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg, options) => {

    let nicknames = options.nicknames ?? (new Date().getHours() == 2 && new Date().getMinutes() == 0)

    for (let db of ['uhg', 'tkjk']) {

        let guild = await uhg.api.call(db == 'uhg' ? '64680ee95aeb48ce80eb7aa8626016c7' : '574bfb977d4c475b8197b73b15194a2a', ['guild'])
        if (!guild.success) continue;
        guild = guild.guild?.guild
        if (guild.name !== 'UltimateHypixelGuild' && guild.name !== 'TKJK') continue;

        let today = Object.keys(guild.members[0].expHistory)[0]
        let yesterday = Object.keys(guild.members[0].expHistory)[1]

       // let temp = await uhg.get('stats', 'guild', {name: db == 'uhg' ? 'UltimateHypixelGuild' : 'TKJK'}).then(n => n[0] || {} )

        /* -- Guild GEXP -- */
        let info = await uhg.get(db, 'info', {_id: 'xp'}).then(n => n[0] || {_id: 'xp', updated: null, total: 0, total_daily: {}, daily: {} })

        info.updated = new Date().getTime()
        info.total = guild.exp
        info.total_daily[today] = guild.exp
        info.daily[today] = guild.exp - (info.total_daily[yesterday] || 0)

        await uhg.post(db, 'info', info)

        let members = await uhg.get(db, 'members', {})
        let left = await uhg.get(db, 'left', {})

        let refreshed = false
        /* -- Handle left MEMBERS --*/

        for (member of members?.filter(n => !guild.members.map(a => a.uuid).includes(n.uuid))) {
            await uhg.post(db, 'left', member)
            await uhg.delete(db, 'members', {_id: member._id})
            refreshed = true
        }

        /* -- Handle joined MEMBERS -- */
        for (member of guild.members.filter(n => !members.map(a => a.uuid).includes(n.uuid))) {
            let user = left.find(n => n.uuid == member.uuid) || { _id : member.uuid, uuid: member.uuid, firstJoined: member.joined, gexp: {} }
            await uhg.post(db, 'members', user)
            await uhg.delete(db, 'left', {_id: user._id})
            refreshed = true
        }

        if (refreshed) {
            members = await uhg.get(db, 'members', {})
            left = await uhg.get(db, 'left', {})
        }

        /* -- Update MEMBERS --*/
        for (let member of members) {
            let api = guild.members.find(n => n.uuid = member.uuid)
            member.joined = api.joined
            member.quests = api.questParticipation

            if (!member.username || nicknames) {
                let user = await uhg.api.call(member.uuid, ['mojang'])
                let username = user.sucess ? user.username : member.username
                member.username = username
            }

            member.gexp = Object.assign({}, api.expHistory, member.gexp, api.expHistory);
            await uhg.post(db, 'members', member)
        }

        /* -- Update left MEMBERS --*/
        for (let member of left) {
            if (!member.username || nicknames) {
                let user = await uhg.api.call(member.uuid, ['mojang'])
                let username = user.sucess ? user.username : member.username
                member.username = username
            }
            await uhg.post(db, 'left', member)
        }

    }
  }
}

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]
const time = require('../../utils/timehandler.js')

module.exports = {
    name: eventName,
    description: "Denní guild statistiky",
    emoji: '🌅',
    time: '0 40 5 * * *', //'*/10 * * * * *'
    ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
    onstart: false,
    run: async (uhg) => {
        let date = new Date().toISOString().slice(0, 10)
        let event = time.start(uhg, eventName)
        try {

            for (let db of ['uhg', 'tkjk']) {
                let nicknames = false
        
                let guild = await uhg.api.call(db == 'uhg' ? '64680ee95aeb48ce80eb7aa8626016c7' : '574bfb977d4c475b8197b73b15194a2a', ['guild'])
                if (!guild.success) continue;
                guild = guild.guild?.guild
                if (guild.name !== 'UltimateHypixelGuild' && guild.name !== 'TKJK') continue;
        
                let today = Object.keys(guild.members[0].expHistory)[0]
                let yesterday = Object.keys(guild.members[0].expHistory)[1]
        
               // let temp = await uhg.get('stats', 'guild', {name: db == 'uhg' ? 'UltimateHypixelGuild' : 'TKJK'}).then(n => n[0] || {} )
        
                /* -- Guild GEXP -- */
                let info = await uhg.mongo.run.get(db, 'info', {_id: 'xp'}).then(n => n[0] || {_id: 'xp', updated: null, total: 0, total_daily: {}, daily: {} })
        
                info.updated = new Date().getTime()
                info.total = guild.exp
                info.total_daily[today] = guild.exp
                info.daily[today] = guild.exp - (info.total_daily[yesterday] || 0)
        
                await uhg.mongo.run.post(db, 'info', info)
        
                let members = await uhg.mongo.run.get(db, 'members', {})
                let left = await uhg.mongo.run.get(db, 'left', {})
        
                let refreshed = false
                /* -- Handle left MEMBERS --*/
        
                for (member of members?.filter(n => !guild.members.map(a => a.uuid).includes(n.uuid))) {
                    await uhg.mongo.run.post(db, 'left', member)
                    await uhg.mongo.run.delete(db, 'members', {_id: member._id})
                    refreshed = true
                }
        
                /* -- Handle joined MEMBERS -- */
                for (member of guild.members.filter(n => !members.map(a => a.uuid).includes(n.uuid))) {
                    let user = left.find(n => n.uuid == member.uuid) || { _id : member.uuid, uuid: member.uuid, firstJoined: member.joined, gexp: {} }
                    await uhg.mongo.run.post(db, 'members', user)
                    await uhg.mongo.run.delete(db, 'left', {_id: user._id})
                    refreshed = true
                }
        
                if (refreshed) {
                    members = await uhg.mongo.run.get(db, 'members', {})
                    left = await uhg.mongo.run.get(db, 'left', {})
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
        
                    await uhg.mongo.run.post(db, 'members', member)
                }
        
                /* -- Update left MEMBERS --*/
                for (let member of left) {
                    if (!member.username || nicknames) {
                        let user = await uhg.api.call(member.uuid, ['mojang'])
                        let username = user.sucess ? user.username : member.username
                        member.username = username
                    }
                    await uhg.mongo.run.post(db, 'left', member)
                }
              }

              

            let data = {
                uhg: await uhg.mongo.run.get('uhg', 'info', {_id: 'xp'}).then(n => n[0]),
                tkjk: await uhg.mongo.run.get('tkjk', 'info', {_id: 'xp'}).then(n => n[0])
            }
      
            /* -- SOME functions -- */
            const exp = (guild = 'uhg', timestamp = 'daily') => data[guild][timestamp][date]
            const level = (guild = 'uhg', timestamp = 'daily') => timestamp == 'daily' ? uhg.ggl(data[guild][timestamp][date]) : uhg.getGuildLevel(data[guild][timestamp][date])
      
            let fields = [
                {name: "UHG", value: `Level: ${Math.round(level('uhg', 'total_daily')*10000)/10000}\nDen: ${Math.round(level()*10000)/10000}\nExp: ${uhg.f(exp()/1000)}k`, inline: true},
                {name: "TKJK", value: `Level: ${Math.round(level('tkjk', 'total_daily')*10000)/10000}\nDen: ${Math.round(level('tkjk')*10000)/10000}\nExp: ${uhg.f(exp('tkjk')/1000)}k`, inline: true },
                {name: "Rozdíl:", value: `Celkový: ${Math.abs(Math.round((level('uhg', 'total_daily') - level('tkjk', 'total_daily'))*10000)/10000)}\nDen: ${Math.round((level() - level('tkjk'))*100000)/100000}\nExp: ${uhg.f((exp() - exp('tkjk'))/1000)}k${exp() - exp('tkjk') < 0 ? '' : `\nPočet dní: ${Math.ceil((exp('tkjk', 'total_daily') - exp('uhg', 'total_daily'))/(exp() - exp('tkjk')))} dní`}`, inline: false}
            ]
            let embed = { title: 'UHG vs TKJK ' + date, color: exp() - exp('tkjk') > 0 ? 2067276 : 15548997, fields: fields }
      
            let channel = uhg.dc.client.channels.cache.get("933036082541498408");
            channel?.send({ embeds: [embed] })
    
        } catch(e) {
            if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
            else console.log(String(e.stack).bgRed + 'Time error v2');
          } finally {
            time.end(uhg, eventName)
        }
    }
}

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]
const time = require('../../utils/timehandler.js')

module.exports = {
    name: eventName,
    description: "Updated CHANNEL INFO",
    emoji: 'ℹ️',
    time: '0 */2 * * * *', //'*/10 * * * * *'
    ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
    onstart: false,
    run: async (uhg) => {
      let date = new Date()
      let event = time.start(uhg, eventName)
      try {
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
            info.level = uhg.getGuildLevel(guild.exp)
            info.weekly = guild.members.reduce((total, player) => Object.values(player.expHistory).reduce((exp, day) => day + exp, 0) + total, 0)
            info.members = guild.members
        }

        const getChannel = (id) => uhg.dc.client.channels.cache.get(id)
        const renameChannel = async (id, name) => (getChannel(id)?.name == name) ? null : await (getChannel(id)?.setName(name))

        // MEMBERS
        if (getChannel('811865691908603904')?.name !== 'Members: 125/125' && data.uhg?.members === 125  ) {
          let kick_channel = uhg.dc.client.channels.cache.get("530496801782890527");

          let mesic = Object.keys(data.uhg.members[0].exp.daily).slice(0,30)

          let msgfrag = []
          let sort = []

        for (let member of data.uhg.members) {
            let mxp = 0
            for (let t=0;t<mesic.length;t++) {
              let xp = mxp += member.exp.daily[mesic[t]] || 0
              mxp += xp
            }
            sort.push({nickname:member.name, exp:mxp, uuid: member.uuid, joined: gmember.joined, firstJoined: member.joined})
          }
        }


        let sorted = sort.sort(function(a, b){ return a.exp - b.exp }).slice(0,10)

        for (let b=0; b<sorted.length; b++) {
          let uApi = await uhg.api.call(sorted[b].uuid, ["hypixel"])
          let timing = '';
          let timing1 = '';
          try {
            if (uApi.hypixel.lastLogin) timing = ` <t:${Math.round(uApi.hypixel.lastLogin/1000)}:R>`
            if (sorted[b].joined !== sorted[b].firstJoined) timing1 = ` (joined <t:${Math.round(sorted[b].joined/1000)}:R>)`
          } catch (e) {}
          msgfrag.push(`\`•\` **${sorted[b].nickname}** - ${uhg.f(sorted[b].exp) + timing + timing1}`)
        }
        let embed = new MessageEmbed().setTitle(`unELITE MEMBERS`).setDescription(`**Nejméně GEXP za 30 dní:**\n\n${msgfrag.join("\n")}`).setFooter('Jen guild membeři, kteří jsou v guildě více jak 7 dní')
        kick_channel.send({ embeds: [embed] })
        


        /* UHG INFO */
        if (data.uhg.members) await renameChannel('811865691908603904', `Members: ${data.uhg.members}/125`)
        if (data.uhg.level) await renameChannel('825659339028955196', `Guild Level: ${uhg.f(data.uhg.level)}`)

        if (data.uhg.level && data.tkjk.level) await renameChannel('928671490436648980', `Rozdíl: ${uhg.f(data.tkjk.level - data.uhg.level, 5)}`)

        /* TKJK INFO */
        if (data.tkjk.level) await renameChannel('928569528676392980', `TKJK: ${uhg.f(data.tkjk.level)}`)
    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}
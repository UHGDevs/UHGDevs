const guildrefresh = require('../../utils/guildrefresh');
const { MessageEmbed } = require('discord.js');
const time = require('../../utils/timehandler.js')

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Informace o guildě",
  emoji: 'ℹ️',
  time: '0 */2 * * * *', //'*/10 * * * * *'
  ignore: '* * 0,1,2,3,23 * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg) => {
    let date = new Date()
    let event = time.start(uhg, eventName)
    try {
      let names = false
      if (date.getHours() == 4 && date.getMinutes() == 2) names = true

      let puhg = await guildrefresh(uhg, 'UltimateHypixelGuild', names)
      let tkjk = await guildrefresh(uhg, 'tkjk', names)
      if (names || date.getHours() == 20 && date.getMinutes() == 10) guildrefresh(uhg, 'czsk', names)

      let gmembers_channel = uhg.dc.client.channels.cache.get("811865691908603904");
      let uhglevel_channel = uhg.dc.client.channels.cache.get("825659339028955196");
      let tkjklevel_channel = uhg.dc.client.channels.cache.get("928569528676392980");
      let rozdil_channel = uhg.dc.client.channels.cache.get("928671490436648980");
      let uhg_weekly_channel = uhg.dc.client.channels.cache.get("990233565314826300");
      let tkjk_weekly_channel = uhg.dc.client.channels.cache.get("990234306746138684");

      let mCount = Number(gmembers_channel.name.replace('Members: ', '').split('/')[0])
      if (mCount !== 125 && puhg.data.members.length === 125) {
        let kick_channel = uhg.dc.client.channels.cache.get("530496801782890527");

        let updated = await guildrefresh(uhg, 'UltimateHypixelGuild')
        if (typeof updated !== 'object') return

        let api = updated.api
        let data = updated.data

        let mesic = Object.keys(data.members[0].exp.daily).slice(0,30)

        let msgfrag = []
        let sort = []

        for (let member of data.members) {
          for (let gmember of api.members) {
            if (member.uuid == gmember.uuid && !gmember.rank.includes("Member")) break;
            if (member.uuid != gmember.uuid) continue;
            if (Number(date) - member.joined < 604800000) break;

            let mxp = 0
            for (let t=0;t<mesic.length;t++) {
              let xp = member.exp.daily[mesic[t]] || 0
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
      }

      let uhglvl = uhg.getGuildLevel(puhg?.data.totalxp)
      let tkjklvl = uhg.getGuildLevel(tkjk?.data.totalxp)
      let rozdil = Math.abs(tkjklvl-uhglvl)
      
      let uhg_weekly_gexp = 0
      let tkjk_weekly_gexp = 0

      let week = Object.keys(puhg.data.members[0].exp.daily).slice(0, date.getDay() || 7)
      for (let day of week) {
        uhg_weekly_gexp += puhg.data.dailyxp[day]
        tkjk_weekly_gexp += tkjk.data.dailyxp[day]
      }

      let gmembers_message = `Members: ${puhg.data.members.length}/125`;
      let uhglevel_message = `Guild Level: ${Math.round(uhglvl*100)/100}`;
      let tkjklevel_message = `TKJK: ${Math.round(tkjklvl*100)/100}`;
      let rozdil_message = `Rozdíl: ${Math.round(rozdil*10000)/10000}`;
      let uhg_weekly_message = `Weekly GEXP: ${uhg.f(uhg_weekly_gexp)}`;
      let tkjk_weekly_message = `TKJK Weekly GEXP: ${uhg.f(tkjk_weekly_gexp)}`;

      try {
        if (gmembers_channel.name !== gmembers_message) await gmembers_channel.setName(gmembers_message)
        if (uhglevel_channel.name !== uhglevel_message) await uhglevel_channel.setName(uhglevel_message)
        if (tkjklevel_channel.name !== tkjklevel_message) await tkjklevel_channel.setName(tkjklevel_message)
        if (rozdil_channel.name !== rozdil_message) await rozdil_channel.setName(rozdil_message)
        if (uhg_weekly_channel.name !== uhg_weekly_message) await uhg_weekly_channel.setName(uhg_weekly_message)
        if (tkjk_weekly_channel.name !== tkjk_weekly_message) await tkjk_weekly_channel.setName(tkjk_weekly_message)
      } catch (e) {
        console.log(e)
        console.log('Chyba v time/events/guildinfo.js:38 - nenalezen kanál')
      }

      let today = Object.keys(puhg.api.members[0].expHistory)[0]
      let yesterday = Object.keys(puhg.api.members[0].expHistory)[1]

      let uhglvl_1 = uhg.getGuildLevel(puhg.data.tdailyxp[yesterday] || 0)
      let tkjklvl_1 = uhg.getGuildLevel(tkjk.data.tdailyxp[yesterday] || 0)

      let rozdil1 = Math.abs(tkjklvl_1 - uhglvl_1)

      let sent = true
      let send = date.getHours() == 4 && date.getMinutes() == 58

      if (send) {
        let channel = uhg.dc.client.channels.cache.get("933036082541498408");

        let emoji = " 🟩 +"
        if (String(rozdil1-rozdil).startsWith("-")) emoji = " 🟥 -"

        let perday = emoji + Math.round(Math.abs(rozdil-rozdil1)*10000)/10000

        let emsend = new MessageEmbed()
            .setTitle(`UHG vs TKJK`)
            .setColor(16109582)
            .addFields(
              {name: "UHG", value: `Level: ${Math.round(uhglvl*10000)/10000}`, inline: true},
              {name: "TKJK", value: `Level: ${Math.round(tkjklvl*10000)/10000}`, inline: true },
              {name: "Rozdíl:", value: `Celkový: ${Math.round(rozdil*10000)/10000}\nDen:${perday}`, inline: false}
              )
        channel.send({ embeds: [emsend] })
      }

if (date.getMinutes() !== 50) return
      let nicknames = false

      for (let db of ['uhg', 'tkjk']) {
  
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
      
    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}

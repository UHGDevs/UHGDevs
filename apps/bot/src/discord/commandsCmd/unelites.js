const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
const guildrefresh = require('../../utils/guildrefresh');
module.exports = {
  name: "unelites",
  allowedids: ["378928808989949964"],
  allowedroles: [],
  platform: "cmd",
  queue: { name: 'Unelites', value: 'unelites', sort: 5 },
  run: async (uhg, interaction) => {
    let date = new Date()
    try {
      let updated = await guildrefresh(uhg, 'UltimateHypixelGuild')
      if (typeof updated !== 'object') return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`**Error v api**`).setColor('RED').setDescription(api)] })

      let amount = interaction.options.getNumber('amount') || 30
      let api = updated.api
      let data = updated.data

      let mesic = Object.keys(data.members[0].exp.daily).slice(0,amount)

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
        let uApi = await uhg.getApi(sorted[b].uuid, ["hypixel"])
        let timing = '';
        let timing1 = '';
        try {
          if (uApi.hypixel.lastLogin) timing = ` <t:${Math.round(uApi.hypixel.lastLogin/1000)}:R>`
          if (sorted[b].joined !== sorted[b].firstJoined) timing1 = ` (joined <t:${Math.round(sorted[b].joined/1000)}:R>)`
        } catch (e) {}
        msgfrag.push(`\`•\` **${sorted[b].nickname}** - ${uhg.f(sorted[b].exp) + timing + timing1}`)
      }
      let embed = new MessageEmbed().setTitle(`unELITE MEMBERS`).setDescription(`**Nejméně GEXP za ${amount} dní:**\n\n${msgfrag.join("\n")}`).setFooter({ text:'Jen guild membeři, kteří jsou v guildě více jak 7 dní'})
      interaction.editReply({ embeds: [embed] })
      
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'UNELITES command')] })
        return "Chyba v cmd unelites příkazu!"
    }
  }
}

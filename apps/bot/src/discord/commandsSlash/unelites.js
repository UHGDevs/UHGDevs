const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');
const guildrefresh = require('../../utils/guildrefresh');

module.exports = {
  name: 'unelites',
  description: 'Show most unactive members',
  permissions: [{ id: '378928808989949964', type: 'USER', permission: true}],
  options: [
    {
      name: 'guild',
      description: 'Kterou guildu chceš vidět?',
      type: 'STRING',
      required: false,
      choices: [
        {
            name: 'UHG',
            value: 'UltimateHypixelGuild'
        },
        {
            name: 'TKJK',
            value: 'TKJK'
        }
      ]
    },
    {
      name: 'days',
      description: 'Kolik dní chceš vidět?',
      type: 'NUMBER',
      required: false
    },
    {
      name: 'members',
      description: 'Kolik lidí chceš vidět? (max 40)',
      type: 'NUMBER',
      required: false
    },
    {
      name: 'filter',
      description: 'Get just members joined more than 7 days? (First guild join)',
      type: 'BOOLEAN',
      required: false
    },
    {
      name: 'visibility',
      description: 'Just flex',
      type: 'BOOLEAN',
      required: false
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    console.log(args)

    let ephemeral = !interaction.options.getBoolean('visibility')

    if (interaction.user.id == '378928808989949964') await interaction.deferReply({ ephemeral: ephemeral }).catch(() => {});
    else await interaction.deferReply({ ephemeral: false }).catch(() => {});

    let days = interaction.options.getNumber('days') || 30
    let guild = interaction.options.getString('guild') || 'UltimateHypixelGuild'
    let members = interaction.options.getNumber('members') || 10
    let filter = !interaction.options.getBoolean('filter')
    

    try {
      let updated = await guildrefresh(uhg, guild)
      if (typeof updated !== 'object') return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`**Error v api**`).setColor('RED').setDescription(api)] })

      let api = updated.api
      let data = updated.data

      let mesic = Object.keys(data.members[0].exp.daily).slice(0, days)

      let msgfrag = []
      let sort = []

      for (let member of data.members) {
        let gmember = api.members.find(n => n.uuid == member.uuid && n.rank.includes('Member') && (new Date().getTime() - member.joined < 604800000 || filter))
        if (!gmember) continue
          let mxp = 0
          for (let t=0;t<mesic.length;t++) {
            let xp = member.exp.daily[mesic[t]] || 0
            mxp += xp
          }
          sort.push({nickname:member.name, exp:mxp, uuid: member.uuid, joined: gmember.joined, firstJoined: member.joined})
        
      }


      let sorted = sort.sort(function(a, b){ return a.exp - b.exp }).slice(0, members).slice(0, 40)

      for (let b=0; b<sorted.length; b++) {
        let uApi = await uhg.getApi(sorted[b].uuid, ["hypixel"])
        let timing = '';
        let timing1 = '';
        try {
          if (uApi.hypixel.lastLogin == -1) timing = ' - \`vyple last login API\`'
          else if (uApi.hypixel.lastLogin) timing = ` <t:${Math.round(uApi.hypixel.lastLogin/1000)}:R>`
          if (sorted[b].joined !== sorted[b].firstJoined) timing1 = ` (joined <t:${Math.round(sorted[b].joined/1000)}:R>)`
        } catch (e) {}
        msgfrag.push(`\`•\` **${sorted[b].nickname}** - ${uhg.f(sorted[b].exp) + timing + timing1}`)
      }
      let embed = new MessageEmbed().setTitle(`unELITE MEMBERS`).setDescription(`**Nejméně GEXP za ${days} dní:**\n\n${msgfrag.join("\n").slice(0, 2000)}`)
      if (filter) embed.setFooter({ text:'Jen guild membeři, kteří poprvé připojili před více jak 7 dny'})
      interaction.editReply({ embeds: [embed] })

    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'TIME Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v TIME slash commandu!"
    }
  }
}
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'badges',
  description: 'Badges INFO',
  permissions: [],
  options: [
    {
      name: 'badge',
      description: 'Jaké chceš vidět badges?',
      type: 'STRING',
      required: false,
      autocomplete: true
    },
    {
      name: 'user',
      description: 'Koho chceš vidět badge?',
      type: 'USER',
      required: false
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: true })
    if (!uhg.badges) return interaction.editReply({ content: 'Badges nejsou načtené!' })
    try {

      let badge = interaction.options.getString('badge') || 'all'
      let user = interaction.options.getUser('user')

      let dcuser = user;
      if (user) user = uhg.data.verify.filter(n => n._id == user.id) || await uhg.mongo.run('general', 'verify', {_id: user.id})
      if (user && !user.length) return interaction.editReply({ content: 'Hráč není verifikovaný!' })
      if (user) user = uhg.data.stats.length ? uhg.data.stats.filter(n => n.uuid === user[0].uuid) : await uhg.mongo.run.get('stats', 'stats', {uuid: user[0].uuid})
      if (user && !user.length) return interaction.editReply({ content: 'Hráč není v databázi!' })
      else if (user) user = user[0] 


      if (badge == 'error') return interaction.editReply({ content: 'Neplatná badge!' })
      else if (badge == 'all' && user) {
        let desc = uhg.badges.map(n => {
          let stat = n.getRole(n.name, user)
          if (!stat.role.name) return
          return `${stat.name} ➜ ${stat.role}`
        }).filter(n => n)
        let badge_player_summary = new MessageEmbed().setTitle(`**Hypixel Badges**`).setColor('GREEN').setDescription(`**Hráč ➜ ${dcuser}\n\n**` + (desc.length ? desc.join('\n') : 'Hráč nemá žádné badges'))
        return interaction.editReply({ embeds: [badge_player_summary] }) 
      } else if (badge == 'all' && !user) {
        let badges = uhg.badges.map(n => n.name)
        return interaction.editReply({ embeds: [ new MessageEmbed().setTitle(`**Hypixel Badges** seznam her`).setColor('GREEN').setDescription(badges.join('\n'))] })
      }

      badge = uhg.badges.find(n => n.name = badge)
    
      if (!badge) return interaction.editReply({ content: 'Badge nebyla nalezena!' })

  
      if (user) {
        let desc = `**Hráč ➜ ${dcuser}** ➜ ${badge.getRole(badge.name, user).role}\n`
        for (const i in badge.stats) {
          
          let stat = uhg.path(badge.path + badge.stats[i], user)
          let levelUp = badge.req[i].filter(n => stat < n)
          let give = badge.req[i].filter(n => stat >= n ).sort((a, b) => b - a)[0] || 0
          let role = badge.roles.find(n => n.req.includes(give)) || 'Žádná role'
          desc = desc + `\n**${badge.statsNames[i]}** ➜ ${uhg.f(stat)}${levelUp.length ? '/'+uhg.f(levelUp[0]):''} ➜ ${role}`
        }
        let badge_player = new MessageEmbed().setTitle(`**${badge.name} Hypixel Badge**`).setColor(badge.roles[0] ? badge.roles[0].color : 'RED').setDescription(desc)
        return interaction.editReply({ embeds: [badge_player] })
      }
      
      let desc_info = ''
      for (const i in badge.roles) {
        let role = badge.roles[i]
          let stats_info = badge.statsNames.map((n, a) => `${n}: ${role.req[a]}` )
          desc_info = desc_info + `\n<@&${role.id}> ➜ ${stats_info.join(', ')}`
      }
      let badge_info = new MessageEmbed().setTitle(`**${badge.name} Hypixel Badge**`).setColor(badge.roles[0] ? badge.roles[0].color : 'RED').setDescription(desc_info)
      
      await interaction.editReply({ embeds: [badge_info] })
    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'BADGES Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v BADGES slash commandu!"
    }
  }
}



const fs = require('fs');
const path = require('node:path');

const badges = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../features/badges/badges.json'), 'utf8'));
const choices = badges.map(n => { return { value: n.name, name: n.name } })

module.exports = {
    name: 'badges',
    description: 'UHG badges info!',
    permissions: [ ],
    options: [
      {
        name: 'badge',
        description: 'Kterou badge chceš vidět?',
        type: 3,
        required: false,
        choices: choices
      },
      {
        name: 'user',
        description: 'Koho chceš vidět badges?',
        type: 6,
        required: false
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: true })

      let badges = uhg.badges

      let badge = interaction.options.getString('badge') || 'all'
      let user = interaction.options.getUser('user')
      if (user) return interaction.editReply({ content: '\'User\' aktuálně nelze použít!' })
      
      if (badge == 'all') {
        return interaction.editReply({ embeds: [ { title: `**Hypixel Badges** seznam her`, description: badges.map(n => n.name).join('\n'), color: 5763719 }] })
      }

      badge = badges.get(badge)
      if (!badge) return interaction.editReply({ content: 'Badge nebyla nalezena!' })
      
      let desc_info = ''
      for (const i in badge.roles) {
        let role = badge.roles[i]
        let stats_info = badge.statsNames.map((n, a) => `${n}: ${role.req ? role.req[a] : `Error - ${String(role.req)}`}` )
        desc_info = desc_info + `\n<@&${role.id}> ➜ ${stats_info.join(', ')}`
      }
      let badge_info = { title: `**${badge.name} Hypixel Badge**`, color: badge.roles[0] ? badge.roles[0].color : 15548997, description: desc_info }
      
      await interaction.editReply({ embeds: [badge_info] })

    }
}
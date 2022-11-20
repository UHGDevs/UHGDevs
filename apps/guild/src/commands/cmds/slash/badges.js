

const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js')

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
        autocomplete: true
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
      await interaction.deferReply({ ephemeral: false })

      let badges = uhg.badges

      let badge = interaction.options.getString('badge') || 'all'
      let user = interaction.options.getUser('user')

      if (user && user.id === global.dc_client.user.id) {
        if (!['378928808989949964', '379640544143343618', '312861502073995265'].includes(interaction.user.id)) return interaction.editReply({ content: 'Nemáš oprávnění na nastavení badges!' })

        badge = badges.get(badge) || badges.badges[0]

        const row = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`badgesGUI_set_choice`).addOptions(badges.badges.map((e, i) => { return {label: e.name, value: e.name, emoji: undefined, default: i==0 ? true : false }} )));
        const stat = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`badgesGUI_set_stat`).addOptions(badge.stats.length ? badge.stats.map((e, i) => { return {label: e.name, value: e.name, emoji: undefined, default: i == 0 ? true : false }} ) : { label: 'Přidej novou statistiku', value: 'void'} ));

        const buttons = new ActionRowBuilder()
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_badge_edit').setStyle(ButtonStyle.Primary).setEmoji('🔧'))
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_badge_add').setStyle(ButtonStyle.Primary).setEmoji('🆕'))
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_badge_remove').setStyle(ButtonStyle.Primary).setEmoji('<:false:1011238405943865355>'));

        const buttons_stat = new ActionRowBuilder()
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_stat_edit').setStyle(ButtonStyle.Primary).setEmoji('🔧'))
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_stat_add').setStyle(ButtonStyle.Primary).setEmoji('🆕'))
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_stat_remove').setStyle(ButtonStyle.Primary).setEmoji('<:false:1011238405943865355>'));
        
        let info = { title: `${badge.name} Badge`, description: `Path: ${badge.path}\n\n${badge.stats.map((n, i) => `${badge.emoji ? badge.emoji + ' ' : ''}**${n.name}**:\nAPI: *${n.path}*\nREQ: *${n.req.join(', ')}*`).join('\n')}` }
        return interaction.editReply({ embeds: [info], components: [row, buttons, stat, buttons_stat] })
      }

      if (user) return interaction.editReply({ content: '\'User\' aktuálně nelze použít!' })

      if (user && badge == 'all') {

      }
      
      if (badge == 'all') {
        return interaction.editReply({ embeds: [ { title: `**Hypixel Badges** seznam her`, description: badges.badges.map(n => n.name).join('\n'), color: 5763719 }] })
      }

      badge = badges.get(badge)
      if (!badge) return interaction.editReply({ content: 'Badge nebyla nalezena!' })

      if (user) {
        
      }


      let role_name = (role) => { return interaction.guild.id == '455751845319802880' ? role : role.name}
      let badge_info = { title: `**${badge.name} Hypixel Badge**`, color: badge.roles[0] ? badge.roles[0].color : 15548997, description: badge.roles.map((n, i) => `${role_name(n)} ➜ ${badge.stats.map(s => `${s.name}: *${s.req[i]}*`).join(', ')}`).join('\n') }
      
      await interaction.editReply({ embeds: [badge_info] })

    },
    autocomplete: (uhg, interaction) => {
      let focused = interaction.options.getFocused();
      interaction.respond(uhg.badges.badges?.map(n => { return {value: n.name, name: n.name} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())) || []) 
  }
}
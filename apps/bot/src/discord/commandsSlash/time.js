const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'time',
  description: 'Time Event GUI',
  permissions: [{ id: '378928808989949964', type: 'USER', permission: true}],
  options: [
    {
      name: 'visibility',
      description: 'Chceš, aby odpověď byla viditělná pro ostatní?',
      type: 'BOOLEAN',
      required: false
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    let ephemeral = !interaction.options.getBoolean('visibility')

    if (interaction.user.id == '378928808989949964') await interaction.deferReply({ ephemeral: ephemeral }).catch(() => {});
    else await interaction.deferReply({ ephemeral: false }).catch(() => {});

    try {
      let auth = ['378928808989949964', '312861502073995265', '379640544143343618', '427198829935460353']
      if (!auth.includes(interaction.user.id)) return interaction.followUp({ embeds: [new MessageEmbed().setTitle(`**TIME EVENT UNVERIFIED**`).setColor('RED').setDescription(`Nejsi na whitelistu :/`)], ephemeral: true })

      
      if (!uhg.time.events.size || uhg.time.events.size !== Object.keys(uhg.settings.time).length) return await interaction.editReply({ embeds: [new MessageEmbed().setTitle('**Time Events GUI**').setColor(5592575).setFooter({ text: 'Made with love ❤️' }).setDescription('Loading, please wait')]})
      let embed = new MessageEmbed().setTitle('**Time Events GUI**').setColor(5592575).setFooter({ text: `${Object.values(uhg.settings.time).filter(n => n).length}/${uhg.time.events.size} Time Events` })

      let desc = []
      let options = []
      for (let event of uhg.time.events) {
        event = event[1]
        let toggle = uhg.settings.time[event.name]
        let message = (event.emoji ? (event.emoji + ' - ') : '') + (toggle ? ('**' + event.name + '**') : event.name)

        if (toggle && event.executedAt) message = message + `<t:${Math.round(Number(new Date(event.executedAt))/1000)}:R>`
        if (event.onstart) message = message + ' 🕐'
        desc.push( message )
        options.push([{label: event.emoji + ' ' + event.name + (toggle ? ' ✅':''), description: event.description, value: event.name}])
        
      }

      const menu = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId('TIME_menu').setPlaceholder('Choose one for more info').addOptions(options));

      embed.setDescription(desc.join('\n'))
      await interaction.editReply({ embeds: [embed], components: [menu] })

    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'TIME Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v TIME slash commandu!"
    }
  }
}


// až se mi nebude chtít vymýšlet nová funkce
// components.push(new MessageButton().setCustomId('TIME_'+event.name).setStyle('PRIMARY').setEmoji(event.emoji))
// for (let i = 0; i < Math.ceil(desc.length % 5); i++) {
//   let button = new MessageActionRow()
//   comp = components.filter((n, o) => (o > i*5 || i === 0 && o === 0) && (o < (i+1)*5))
//   comp.forEach(n => { button.addComponents(n)});
//   buttons.push(button)
// }
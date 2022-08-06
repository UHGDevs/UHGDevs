const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");
const fs = require('fs');

module.exports = async (uhg, interaction) => {
  await interaction.update({ type:6, ephemeral: true })

  let type = interaction.customId.split('_')[3]
  let action = interaction.customId.split('_')[2]

  interaction.updateGUI = type

  let event = uhg.time.events.get(type)
  if (!event) return interaction.followUp({ embeds: [new MessageEmbed().setTitle(`**TIME EVENT ERROR**`).setColor('RED').setDescription(`**${type} Time Event** není načtený`)], ephemeral: true })


  let auth = ['378928808989949964', '312861502073995265', '379640544143343618', '427198829935460353']
  if (!auth.includes(interaction.user.id) && action !== 'refresh') return interaction.followUp({ embeds: [new MessageEmbed().setTitle(`**TIME EVENT UNVERIFIED**`).setColor('RED').setDescription(`Nejsi na whitelistu :/`)], ephemeral: true })
  
  if (action == 'refresh') {
    return require('./time_gui') (uhg, interaction)
  }

  let embed = new MessageEmbed().setTitle(`${event.emoji} **__${type} Time Event__** ${event.emoji}`).setDescription(event.description).setFooter({ text: '--- By DavidCzPdy 🤖 ---' })

  if (action == 'run') {
    embed.addField('**__Action__**', `Run ${type} Time Event`, false)
    if (!uhg.time.ready[type]) embed.addField('**__Result__**', `**REJECTED**`).setColor('RED').addField('**__Reason__**', `${type} is already RUNNING`, false);
    else {
      run(uhg, event)
      embed.addField('**__Result__**', `**SUCCESS**\n${type} is now running`).setColor('GREEN')
    }
  } else if (action === 'true' ) {
    embed.addField('**__Action__**', `Enable ${type} Time Event`, false)
    let config = uhg.settings

    if (config.time[type]) embed.addField('**__Result__**', `**REJECTED**`).setColor('RED').addField('**__Reason__**', `${type} is already ENABLED`, false);
    else {
      config.time[type] = true
      await fs.writeFile('settings/config.json', JSON.stringify(config, null, 4), 'utf8', data =>{})
      embed.addField('**__Result__**', `**SUCCESS**\n${type} is now ENABLED`).setColor('GREEN')
    }
  } else if (action === 'false') {
    embed.addField('**__Action__**', `Disable ${type} Time Event`, false)
    let config = uhg.settings

    if (!config.time[type]) embed.addField('**__Result__**', `**REJECTED**`).setColor('RED').addField('**__Reason__**', `${type} is already DISABLED`, false);
    else {
      config.time[type] = false
      await fs.writeFile('settings/config.json', JSON.stringify(config, null, 4), 'utf8', data =>{})
      embed.addField('**__Result__**', `**SUCCESS**\n*${type} is now DISABLED*`).setColor('GREEN')
    }
  }

  await uhg.delay(700)

  interaction.followUp({ embeds: [embed], ephemeral: true })
  require('./time_gui') (uhg, interaction)
}


async function run(uhg, pull) {
  if (!uhg.time.ready[pull.name]) return
  uhg.time.ready[pull.name]=false
  await pull.run(uhg);
  uhg.time.ready[pull.name]=true
}
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
    embed.addFields({ name: '**__Action__**', value: `Run ${type} Time Event`, inline: false})
    if (!uhg.time.ready[type]) embed.addFields({ name: '**__Result__**', value: `**REJECTED**`}, {name: '**__Reason__**', value: `${type} is already RUNNING`, inline: false}).setColor('RED')
    else {
      run(uhg, event)
      embed.addFields({ name: '**__Result__**', value: `**SUCCESS**\n${type} is now running`}).setColor('GREEN')
    }
  } else if (action === 'true' ) {
    embed.addFields({ name: '**__Action__**', value: `Enable ${type} Time Event`, inline: false})
    let config = uhg.settings

    if (config.time[type]) embed.addFields({ name: '**__Result__**', value: `**REJECTED**`}, {name: '**__Reason__**', value: `${type} is already ENABLED`, inline: false}).setColor('RED')
    else {
      config.time[type] = true
      await fs.writeFile('src/settings/config.json', JSON.stringify(config, null, 4), 'utf8', data =>{})
      embed.addFields({ name: '**__Result__**', value: `**SUCCESS**\n${type} is now ENABLED`}).setColor('GREEN')
    }
  } else if (action === 'false') {
    embed.addFields({ name: '**__Action__**', value: `Disable ${type} Time Event`, inline: false})
    let config = uhg.settings

    if (!config.time[type]) embed.addFields({name: '**__Result__**', value: `**REJECTED**`, inline: true}, {name: '**__Reason__**', valie: `${type} is already DISABLED`, inline: false}).setColor('RED');
    else {
      config.time[type] = false
      await fs.writeFile('src/settings/config.json', JSON.stringify(config, null, 4), 'utf8', data =>{})
      embed.addFields({ name: '**__Result__**', values: `**SUCCESS**\n*${type} is now DISABLED*`}).setColor('GREEN')
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
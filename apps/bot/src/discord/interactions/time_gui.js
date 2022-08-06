const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = async (uhg, interaction) => {
  try { await interaction.update({ type:6, ephemeral: true }) } catch (e) {}
  let type = interaction.updateGUI || interaction.values[0]
  let toggle = uhg.settings.time[type]

  let event = uhg.time.events.get(type)
  if (!event) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`**TIME EVENT ERROR**`).setColor('RED').setDescription(`**${type} Time Event** není načtený`)] })
  
  let embed = new MessageEmbed().setTitle(`${event.emoji} **__${type} Time Event__** ${event.emoji}`).setColor('#ff51fd').setDescription(event.description)
  embed.addFields({ name: `ㅤ`, value: `**__Basic Info__**`, inline: false})
  embed.addField('Toggle', (toggle ? '✅' : '🟥') + (event.onstart ? ' | 🕐' : ''), true)
  
  let execution = event.executedAt ? `<t:${Math.round(Number(new Date(event.executedAt))/1000)}:R>` : `🟥 `// | <t:${Math.round(new Date().getTime()/1000)}:R>`
  if (!uhg.time.ready[type]) execution = '👟' + ` | <t:${Math.round(Number(new Date(event.executedAt || new Date()))/1000)}:R>`
  embed.addField('Last Execution', execution, true)

  //embed.addField(`ㅤ`, `ㅤ`, false)
  embed.addFields(
    { name: 'Next execution', value: `<t:${Math.round(new Date(event.start.nextDates()).getTime()/1000)}:R>`, inline: true },
    { name: 'Period', value: `\`${event.start.cronTime.source}\``, inline: true },
    { name: 'Ignore', value: `\`${event.ignore}\``, inline: true },
    //{ name: , value: '', inlune: true },
  )
  if (event.lastTime) {
    embed.addFields(
      { name: `ㅤ`, value: `**__Nerds Stats__**`, inline: false},
      { name: 'Count', value: `\`${event.count}\``, inline: true },
      { name: 'Last Time', value: `\`${uhg.f(event.lastTime/1000)}s\``, inline: true },
      { name: 'Average Time', value: `\`${uhg.f(event.averageTime/1000)}s\``, inline: true },
      { name: `Max Time [${event.times.indexOf(Math.max(...event.times)) + 1}]`, value: `\`${Math.round(Math.max(...event.times)/100)/10}s\``, inline: true },
      { name: `Min Time [${event.times.indexOf(Math.min(...event.times)) + 1}]`, value: `\`${Math.round(Math.min(...event.times)/100)/10}s\``, inline: true },
    )
  }

  if (event.errors) {
    embed.addFields({ name: `ㅤ`, value: `**__${event.errors.length} Error${event.errors.length>1?`s`:``}__**`, inline: false})
    embed.addFields(event.errors.slice(0,5))
  }

  let options = []
  for (let ev of uhg.time.events) {
    ev=ev[1]
    options.push([{label: ev.emoji + ' ' + ev.name + (uhg.settings.time[ev.name] ? ' ✅':''), description: ev.description, value: ev.name}])
  }
  
  const menu = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId('TIME_menu').setPlaceholder(`${type} Time Event GUI`).addOptions(options));
  const buttons = new MessageActionRow()
    .addComponents(new MessageButton().setCustomId(`TIME_RUN_${!toggle}_${type}`).setStyle(toggle ? 'DANGER':'SUCCESS').setLabel(toggle ? 'DISABLE':'ENABLE'))
    .addComponents(new MessageButton().setCustomId(`TIME_RUN_run_${type}`).setStyle('SUCCESS').setLabel('RUN'))
    .addComponents(new MessageButton().setCustomId(`TIME_RUN_refresh_${type}`).setStyle('SECONDARY').setLabel('REFRESH'))
  embed.setFooter({ text: `ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n *ㅤㅤ*ㅤㅤ*ㅤㅤ*ㅤㅤ*ㅤㅤ*\nsec min hour date month day`})

  return interaction.editReply({ embeds: [embed], components: [menu, buttons], ephemeral: true })
}

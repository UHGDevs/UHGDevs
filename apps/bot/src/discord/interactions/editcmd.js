const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = async (uhg, interaction) => {
  try { await interaction.update({ type:6, ephemeral: true }) } catch (e) {}
  let type = interaction.customId.split('_')[1]
  let action = interaction.customId.split('_')[2]
  let arg = interaction.customId.split('_')[3]
  let krok = Number(interaction.message.components[0].components.find(n => n.customId.endsWith('_set_krok')).label.replace('Krok: ', ''))

  let data = interaction.message.cache || await uhg.mongo.run.get('general', 'commands', { _id: type }).then(n=> n[0] || null) || undefined
  if (!data) return


  if (action == 'set' && arg == 'krok') {
    if (krok === 1) krok = 5
    else if (krok === 5) krok = 10
    else if (krok === 10) krok = 50
    else krok = 1
  }


  interaction.message.cache = data

  const but_pos = new MessageActionRow()
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_left`).setStyle('PRIMARY').setLabel('◄'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_right`).setStyle('PRIMARY').setLabel('►'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_up`).setStyle('PRIMARY').setLabel('▲'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_down`).setStyle('PRIMARY').setLabel('▼'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_krok`).setStyle('PRIMARY').setLabel(`Krok: ${krok}`));

  interaction.editReply({ components: [but_pos] })
}

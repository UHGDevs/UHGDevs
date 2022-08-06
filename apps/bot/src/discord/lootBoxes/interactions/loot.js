const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = async (uhg, interaction) => {
  let type = interaction.customId.split('_')[1]
  await interaction.update({ type:6, ephemeral: true })

  let msg;
  if (type == 'box') {
    interaction.followUp(uhg.loot.data.box_bronze)
    interaction.followUp(uhg.loot.data.box_gold)
    interaction.followUp(uhg.loot.data.box_diamond)
    return
  } else if (type == 'inventory') {

  } else if (type == 'key') msg = uhg.loot.data.key_chance
  else if (interaction.customId.startsWith('LOOT_BOX_open_')) {
    let box = interaction.customId.split('_')[3]
  } else if (interaction.customId.startsWith('LOOT_BOX_buy_')) {
    let box = interaction.customId.split('_')[3]
  }


  if (!msg) return interaction.followUp({ content: 'not YET', ephemeral: true })
  interaction.followUp(msg)
}

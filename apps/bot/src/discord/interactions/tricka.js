const { MessageEmbed } = require("discord.js");

module.exports = async (uhg, interaction) => {
  try {
    await interaction.deferReply({ ephemeral: false })
    let type = interaction.customId.split('_')[1]
    let id = interaction.customId.split('_')[2]

    if (type == 'info') {
      interaction.editReply({ content: 'Bot neobsahuje žádné info!'})
    }

    if (type == 'buy') {
      interaction.editReply({ content: 'Ještě tričko nelze koupit!'})
    }
  } catch(e) {
    console.log(e)
  }
}

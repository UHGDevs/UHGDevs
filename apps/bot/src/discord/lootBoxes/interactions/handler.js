
module.exports = async (uhg, interaction) => {
    if (interaction.isButton()) require('./loot') (uhg, interaction)
  }
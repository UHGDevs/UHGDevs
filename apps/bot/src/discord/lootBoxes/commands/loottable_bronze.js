const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "loottable_bronze",
  allowedids: ["378928808989949964", '379640544143343618'],
  allowedroles: [],
  platform: "loot",
  queue: { name: 'Bronze G-Box Loot Table', value: 'loottable_bronze', sort: 10 },
  run: async (uhg, interaction) => {
    try {
      return interaction.editReply(uhg.loot.data.loottable_bronze)
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'loot BRONZE LOOTTABLE command')] })
        return
    }
  }
}

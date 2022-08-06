const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "box_gold",
  allowedids: ["378928808989949964", '379640544143343618'],
  allowedroles: [],
  platform: "loot",
  queue: { name: 'Gold Box GUI', value: 'box_gold', sort: 16 },
  run: async (uhg, interaction) => {
    try {
      return interaction.editReply(uhg.loot.data.box_gold)
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'loot GoldBox command')] })
        return
    }
  }
}

const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "box_bronze",
  allowedids: ["378928808989949964", '379640544143343618'],
  allowedroles: [],
  platform: "loot",
  queue: { name: 'Bronze Box GUI', value: 'box_bronze', sort: 15 },
  run: async (uhg, interaction) => {
    try {
      return interaction.editReply(uhg.loot.data.box_bronze)
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'loot BronzeBox command')] })
        return
    }
  }
}

const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "box_diamond",
  allowedids: ["378928808989949964", '379640544143343618'],
  allowedroles: [],
  platform: "loot",
  queue: { name: 'Diamond Box GUI', value: 'box_diamond', sort: 17 },
  run: async (uhg, interaction) => {
    try {
      return interaction.editReply(uhg.loot.data.box_diamond)
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'loot DiamondBox command')] })
        return
    }
  }
}

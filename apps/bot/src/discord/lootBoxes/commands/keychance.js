const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "keychance",
  allowedids: [],
  allowedroles: ["530504032708460584", '379640544143343618'],
  platform: "loot",
  queue: { name: 'Key Chance', value: 'keychance', sort: 13 },
  run: async (uhg, interaction) => {
    try {
      return interaction.editReply(uhg.loot.data.key_chance)
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'loot KEYCHANCE command')] })
        return
    }
  }
}

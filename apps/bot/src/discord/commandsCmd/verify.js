const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "verify",
  allowedids: [],
  allowedroles: [],
  platform: "cmd",
  queue: { name: 'Verify', value: 'verify', sort: 3 },
  run: async (uhg, interaction) => {
    try {
      //not here LOL
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'VERIFY command')] })
        return "Chyba v cmd verify příkazu!"
    }
  }
}

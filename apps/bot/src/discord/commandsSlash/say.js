const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
  name: 'say',
  description: 'Napíše zprávu přes bota na Hypixel',
  permissions: [{ id: '530504567528620063', type: 'ROLE', permission: true}, { id: '475585340762226698', type: 'ROLE', permission: true}/*, { id: '475585340762226698', type: 'ROLE', permission: true}, { id: '530504766225383425', type: 'ROLE', permission: true}*/],
  options: [
    {
      name: 'message',
      description: 'Napiš zprávu k deslání',
      type: 'STRING',
      required: true
    },
    {
      name: 'visibility',
      description: 'Chceš, aby zpráva byla viditelná?',
      type: 'BOOLEAN',
      required: false
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {

    let ephemeral = !interaction.options.getBoolean('visibility')

    await interaction.deferReply({ ephemeral: ephemeral }).catch(() => {});

    let msg = interaction.options.getString('message')
    

    try {
      require("../../minecraft/send.js").send(uhg, {send: msg})
        
      let embed = new MessageEmbed().setTitle(msg).setAuthor({name:`${interaction.user.username}#${interaction.user.discriminator}`, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.jpeg`})
      interaction.editReply({ embeds: [embed] })

    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'say Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v say slash commandu!"
    }
  }
}
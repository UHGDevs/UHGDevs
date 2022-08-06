const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'omluvenky',
  description: 'Time Event GUI',
  permissions: [{ id: '378928808989949964', type: 'USER', permission: true}],
  options: [
    {
      name: 'datum',
      description: 'Kdy se chceš omluvit? (např. 12.6. - 19.6.)',
      type: 'STRING',
      required: true
    },
    {
      name: 'reason',
      description: 'Jaký je důvod neaktiviti? (např. dovolená)',
      type: 'STRING',
      required: true
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: true })
    try {
      let verify = uhg.data.verify.filter(n => n._id == interaction.user.id) || await uhg.mongo.run('general', 'verify', {_id: interaction.user.id})
      console.log(verify)
      let embed = new MessageEmbed().setTitle(`Omluvenka od ${interaction.nickname || interaction.user.username}`).setColor(5592575).addField('USER:', `${interaction.user}\n**IGN:**\n${verify[0].nickname||'unverified'}`).addField('DATUM:', interaction.options.getString('datum')).addField('REASON:', interaction.options.getString('reason'))
      
      uhg.dc.client.channels.cache.get('947234635375595520').send({ embeds: [embed] })
      await interaction.editReply({ content: 'Omluvenka přijata', ephemeral: true })
    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'OMLUVENKY Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v OMLUVENKY slash commandu!"
    }
  }
}

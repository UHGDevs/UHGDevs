const { MessageEmbed } = require("discord.js")

module.exports = {
  name: 'qotd',
  description: 'Command for UHG QOTD',
  permissions: [ {id: '378928808989949964', type: 'USER', permission: true }, { id: '660441379310272513', type: 'USER', permission: true}, { id: '456149035481563147', type: 'ROLE', permission: true }, { id: '572651929625296916', type: 'ROLE', permission: true }, { id: '478610913386168360', type: 'ROLE', permission: true }],
  options: [
    {
      name: 'question',
      description: 'Jaká má být otázka?',
      type: 'STRING',
      required: true
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: true })
    try {
      let qotd = await uhg.mongo.run.get('general', 'qotd', {}).then(n => n.sort((a, b) => b._id - a._id))
      let question = interaction.options.getString('question')

      if (question?.toLowerCase() == 'view') {
        questions = qotd.filter(n => !n.completed).sort((a, b) => a._id - b._id).map(n => `Day ${n._id}: ${n.question}`)
        let embed = new MessageEmbed().setTitle('Nadcházející QOTD').setDescription(`**Počet:** ${questions.length}\n\n**Otázky:**\n${questions.join('\n') || 'Žádné!'}`).setColor(questions.length > 0 ? (questions.length > 3 ? 'GREEN': 'YELLOW') : 'RED')
        interaction.editReply({ embeds: [embed], ephemeral: true })
        return
      }

      let day = qotd[0] ? Number(qotd[0]._id) + 1 : 0
      await uhg.mongo.run.post('general', 'qotd', {_id: day, question: question })

      await interaction.editReply({ content: `QOTD #${day} byl přidán`, ephemeral: true })
    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'QOTD Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v QOTD slash commandu!"
    }
  }
}

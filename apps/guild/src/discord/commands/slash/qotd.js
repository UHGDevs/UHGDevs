

const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'qotd',
    description: 'Command for UHG QOTD!',
    permissions: [ {id: '378928808989949964', type: 'USER', permission: true }, { id: '660441379310272513', type: 'USER', permission: true}],
    options: [
      {
        name: 'question',
        description: 'Jaká má být otázka?',
        type: 3,
        required: true
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: true })
      let qotd = await uhg.get('general', 'qotd').then(n => n.sort((a, b) => b._id - a._id))
      let question = interaction.options.getString('question')

      if (question?.toLowerCase() == 'view') {
        questions = qotd.filter(n => !n.completed).sort((a, b) => a._id - b._id).map(n => `Day ${n._id}: ${n.question}`)
        let embed = new EmbedBuilder().setTitle('Nadcházející QOTD').setDescription(`**Počet:** ${questions.length}\n\n**Otázky:**\n${questions.join('\n') || 'Žádné!'}`).setColor(questions.length > 0 ? (questions.length > 3 ? 2067276: 16705372) : 15548997)
        interaction.editReply({ embeds: [embed], ephemeral: true })
        return
      }

      let day = qotd[0] ? Number(qotd[0]._id) + 1 : 0
      await uhg.post('general', 'qotd', {_id: day, question: question })

      await interaction.editReply({ content: `QOTD #${day} byl přidán`, ephemeral: true })
  }
}
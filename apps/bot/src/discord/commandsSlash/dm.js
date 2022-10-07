
module.exports = {
  name: 'dm',
  description: 'Message group of users!',
  permissions: [{ id: '378928808989949964', type: 'USER', permission: true}, { id: '312861502073995265', type: 'USER', permission: true},  { id: '379640544143343618', type: 'USER', permission: true}],
  options: [
    {
      name: 'role',
      description: 'Komu všemu mám napsat zprávu?',
      type: 'ROLE',
      required: true
    },
    {
      name: 'message',
      description: 'Jaká zpráva?',
      type: 'STRING',
      required: true
    },
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: true })
    try {

      await interaction.guild.members.fetch()
      let role = interaction.options.getRole('role')
      let members = role.members
  
      let msg = interaction.options.getString('message')

      interaction.editReply({ content: `Sending \`${msg}\` to \`${members.size}\` people`})
      
      let errors = []
      let sent = members.size;
      for (let member of members) {
        let user = member[1].user
        await user?.send({ content: msg }).catch(e => {
          sent -= 1
          errors.push(user)
        })
      }
  
      interaction.editReply({ content: `Messages sent: \`${sent}/${members.size}\`` })
      uhg.dc.client.channels.get('1027491511857840168')?.send({ content: msg, embeds: [{ title: `\`${sent}/${members.size}\` messages sent to ${role} members`, description: errors.length ? errors.join(', ') : undefined, color: errors.length ? 'RED': 'GREEN' }] })


    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'DM Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v DM slash commandu!"
    }
  }
}

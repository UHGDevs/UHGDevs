
module.exports = {
    name: 'dm',
    description: 'Message group of users!',
    permissions: [ {id: '378928808989949964', type: 'USER', permission: true} ],
    options: [
      {
        name: 'role',
        description: 'Komu všemu mám napsat zprávu?',
        type: 8,
        required: true
      },
      {
        name: 'message',
        description: 'Jaká zpráva?',
        type: 3,
        required: true
      },
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: true })


      let role = interaction.options.getRole('role')

      //let members = await dc_client.guilds.cache.get(interaction.guild.id).members.fetch()
      //members = members.filter(n => n._roles.includes(role.id))

      let msg = interaction.options.getString('message')

      for (let member of role.members) {
        let user = member[1].user
        await user?.send({ content: msg })
      }

      interaction.editReply({ content: `Messaged ${role.members.size} lidí!` })
    }
}
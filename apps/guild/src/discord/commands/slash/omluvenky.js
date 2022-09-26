const { ActionRowBuilder, ButtonBuilder  } = require("discord.js");

module.exports = {
    name: 'omluvenky',
    description: 'Omluv se a žij!',
    permissions: [ {id: '530504032708460584', type: 'ROLE', permission: true }, {id: '378928808989949964', type: 'USER', permission: true}],
    options: [
      {
        name: 'datum',
        description: 'Kdy se chceš omluvit? (např. 12.6. - 19.6.)',
        type: 3,
        required: true
      },
      {
        name: 'reason',
        description: 'Jaký je důvod neaktiviti? (např. dovolená)',
        type: 3,
        required: true
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: true })
      interaction.editReply({ content: 'Not working yet' })
    }
}
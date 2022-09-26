
const fs = require('fs');
const path = require('node:path');

const embeds = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../embeds/staff.json'), 'utf8'));

const choices = Object.keys(embeds).map(n => { return { value: n, name: embeds[n].title?.replace(' funkce', '') } })

module.exports = {
    name: 'staff',
    description: 'UHG staff!',
    permissions: [ ],
    options: [
      {
        name: 'kategorie',
        description: 'Jakou kategorii chceš vidět?',
        type: 3,
        required: true,
        choices: choices
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: true })

      let search = interaction.options.getString('kategorie');
      
      interaction.editReply({ embeds: [embeds[search]] })

    }
}
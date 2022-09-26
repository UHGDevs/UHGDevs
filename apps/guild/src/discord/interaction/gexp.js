
const fs = require('fs');
const path = require('node:path');

const znovu = { title: 'ERROR', description: 'Nepodařilo se načíst cache!\nPoužij prosím příkaz znovu', color: 15158332, footer: {text: 'UHGDevs' }}

module.exports = async (uhg, interaction) => {
    await interaction.update({ type:6 })

    let embeds = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../cache/gexp.json'), 'utf8'));
    let pages = embeds[interaction.message.embeds[0].title]
  
    if (!pages) return interaction.editReply({ embeds: [znovu], components: [] })
  
    let pageid = interaction.customId.split('_')[1]
    let v = interaction.message.embeds[0].footer.text.split("/")[0]
  
    if (pageid == 'first') {
      await interaction.editReply({ embeds: [pages[0]] })
    } else if (pageid == 'back' && v>1) {
        await interaction.editReply({ embeds: [pages[v-2]] })
    } else if (pageid == 'next' && v < pages.length) {
        await interaction.editReply({ embeds: [pages[v]] })
    } else if (pageid == 'last') await interaction.editReply({ embeds: [pages[pages.length-1]] })
  
}

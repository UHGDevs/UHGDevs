const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const fs = require('fs');

const znovu = new MessageEmbed().setTitle("ERROR").setDescription("Nepodařilo se načíst cache!\nPoužij prosím příkaz znovu").setColor(15158332).setFooter({text: "Vývojáři Farmans & DavidCzPdy"})

module.exports = async (uhg, interaction) => {
  await interaction.update({ type:6 })

  let embeds = JSON.parse(fs.readFileSync('settings/cache/lb.json', 'utf8'));
  let pages = embeds[interaction.message.embeds[0].title]

  if (!pages) return interaction.editReply({ embeds: [znovu], components: [] })

  let pageid = interaction.customId.toLowerCase()
  let v = interaction.message.embeds[0].footer.text.split("/")[0]

  if (pageid.includes('first')) {
    await interaction.editReply({ embeds: [pages[0]] })
  } else if (pageid.includes('back') && v>1) {
      await interaction.editReply({ embeds: [pages[v-2]] })
  } else if (pageid.includes('next') && v < pages.length) {
      await interaction.editReply({ embeds: [pages[v]] })
  } else if (pageid.includes('last')) await interaction.editReply({ embeds: [pages[pages.length-1]] })

}

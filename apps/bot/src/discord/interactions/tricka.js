const { MessageEmbed } = require("discord.js");

module.exports = async (uhg, interaction) => {
  try {
    await interaction.deferReply({ ephemeral: true })
    let type = interaction.customId.split('_')[1]

    if (type == 'info') {
      interaction.editReply({ embeds: [{
        title: 'UHG Trička informace',
        description: `- Barva French Navy <:frenchnavy:1166810791123623947>\n- 100 % organická bavlna - předpraná\n- Jednovrstvový materiál\n- Zapuštěný rukáv\n- 1x1 žebrovaný lem na krku\n- Vnitřní páska na zadní straně krku z toho samého materiálu\n- Lem rukávu a spodní lem se širokým dvojitým prošíváním\n- Střední střih\n- Hmotnost: 150 g/m²`,
        image: { url: 'https://media.discordapp.net/attachments/408250362978369546/1166810978390904904/image.png?ex=654bd867&is=65396367&hm=bd14b0cbe41b0b41740ec1d78fab9f049cc735a964ff3681d1b89237ecd900a4&=&width=1396&height=506' },
      }]})
    }
  } catch(e) {
    console.log(e)
  }
}

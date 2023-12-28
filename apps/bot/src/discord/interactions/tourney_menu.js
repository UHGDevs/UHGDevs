const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = async (uhg, interaction) => {
  try {
    await interaction.update({ type:6 })

    let tourney = interaction.values[0]
    let db = await uhg.mongo.run.get("general", "tourneys", {tourney: tourney})

    let embed = interaction.message?.embeds[0]
    embed.title = tourney

    if (embed.fields.length != 2) {
      embed.addFields({name: `Total Games`, value: `${db[0].games}`})
      embed.addFields({name: `Cute Name`, value: `${db[0].cutename}`})
    } else {
      embed.fields[0] = {name: `Total Games`, value: `${db[0].games}`}
      embed.fields[1] = {name: `Cute Name`, value: `${db[0].cutename}`}
    }

    let buttons = new MessageActionRow()
      .addComponents(new MessageButton().setCustomId("TOURNEY_EDIT").setLabel("EDIT").setStyle("PRIMARY"))
      .addComponents(new MessageButton().setCustomId("TOURNEY_PLAYER").setLabel("ADD").setStyle("SECONDARY"));

    await interaction.editReply({ embeds: [embed], components: [interaction.message?.components[0], buttons] })
   
  } catch(e) {
    console.log(e)
  }
}

const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

let reject =  new MessageActionRow().addComponents(new MessageButton().setCustomId('verlang_reject').setLabel('Nepřidán do databáze').setStyle('DANGER').setDisabled(true))
let accept =  new MessageActionRow().addComponents(new MessageButton().setCustomId('verlang_accept').setLabel('Přidán do databáze').setStyle('SUCCESS').setDisabled(true))

module.exports = async (uhg, interaction) => {
  let customId = uhg.dontFormat(interaction.customId).split("-")
  await interaction.update({ type:6 })

  let api = await uhg.getApi(customId[2], ["hypixel"])

  let embed;

  if (customId[3] == "accept") {
    uhg.mongo.run.post("stats", "stats", api.hypixel)
    embed = new MessageEmbed().setTitle(`${customId[1]} byl přidán do databáze`).setColor("GREEN")
    await interaction.editReply({ components: [accept] })
  }
  else if (customId[3] == "reject") {
    interaction.member.roles.add(interaction.member.guild.roles.cache.find(role => role.id == "985095284893814814"))
    embed = new MessageEmbed().setTitle(`${customId[1]} nebyl přidán do databáze`).setColor("RED")
    await interaction.editReply({ components: [reject] })
  }

  if (!embed) return interaction.reply({ content: `Někde nastala chyba - ${interaction.customId}`, ephemeral: false })
  interaction.followUp({ embeds: [embed] })

}

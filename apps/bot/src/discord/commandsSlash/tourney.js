const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js")

module.exports = {
  name: 'tourneys',
  description: 'Command for Hypixel tourneys',
  permissions: [ {id: "312861502073995265", type: "USER", permission:true}, {id: '572651929625296916', type: 'ROLE', permission: true }, { id: '478610913386168360', type: 'ROLE', permission: true}, { id: '530504567528620063', type: 'ROLE', permission: true}],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: false })
    try {
      let db = await uhg.mongo.run.get('general', 'tourneys')
      let obj = {}
      db.forEach(e => {
        if (e._id != 0) obj[e.tourney] = e
      });
      let tourneys = Object.keys(obj);
      let options = [];
      for (let i = tourneys.length-5; i<tourneys.length; i++) {
        options.push({label: tourneys[i], value: tourneys[i]})
      }
      let embed = new MessageEmbed().setTitle("Hypixel Tourneys").setDescription("Níže máš 5 posledních turnajů").setFooter({text: "by Farmans <3 :3"})
      let select = new MessageSelectMenu().setCustomId(`TOURNEY_MENU`).setPlaceholder("Vyber turnaj").addOptions(options)
      let menu = new MessageActionRow().addComponents(select)

      await interaction.editReply({ embeds: [embed], components: [menu] })
    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'Tourneys Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v Tourneys slash commandu!"
    }
  }
}

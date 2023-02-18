const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
module.exports = {
  name: "roles",
  aliases: ["role"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      let embed = new MessageEmbed().setTitle("**Role**").setDescription("<:dot:1003711491196854393>Rozdělené do čtyř sekcí *(Guild, Discord, Hypixel Badges a Reaction role)*\n\n<:guild:1003709664179007519> ➜ Guild\n<:discord:1003709661335277569> ➜ Discord\n<:games:1003709662941675541> ➜ Hypixel Badges\n<:custom:1012072500160639006> ➜ Reaction Role")
      let buttons =  new MessageActionRow()
        .addComponents(new MessageButton().setCustomId('uhg_embeds_guild').setStyle('SECONDARY').setDisabled(false).setEmoji('<:guild:1003709664179007519>'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_discord').setStyle('SECONDARY').setDisabled(false).setEmoji('<:discord:1003709661335277569>'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_badges').setStyle('SECONDARY').setDisabled(false).setEmoji('<:games:1003709662941675541>'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_reactionrole').setStyle('SECONDARY').setDisabled(false).setEmoji('<:custom:1012072500160639006>'))

      let op = ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"]
      if (content == 'roles' && op.includes(message.author.id)) uhg.dc.client.channels.cache.get('504354471669792769').send({ embeds: [embed], components: [buttons]});
      else message.channel.send({ embeds: [embed], components: [buttons] });
      return
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v roles příkazu!"
    }
  }
}

const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
module.exports = {
  name: "rules",
  aliases: ["pravidla"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      let embed = new MessageEmbed().setTitle("**Informace Guildy**").setDescription("Přehled:\n⚠️ ``Pravidla guildy``\n<:elitemember:979390144153018428> ``Elite membeři``\n🎲 ``Guild eventy``\n<:botuhg:979390792747581460> ``Guild Bot (UHGuild)``\n👕 ``UHG Tričko``")
      let buttons =  new MessageActionRow()
        .addComponents(new MessageButton().setCustomId('uhg_embeds_pravidla')/*.setLabel('⚠️ Pravidla guildy')*/.setStyle('SECONDARY').setDisabled(false).setEmoji('⚠️'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_elites')/*.setLabel('Elite membeři')*/.setStyle('SECONDARY').setDisabled(false).setEmoji('<:elitemember:979390144153018428>'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_events')/*.setLabel('Guild eventy')*/.setStyle('SECONDARY').setDisabled(false).setEmoji('🎲'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_bot')/*.setLabel('Guild bot')*/.setStyle('SECONDARY').setDisabled(true).setEmoji('<:botuhg:979390792747581460>'))
        .addComponents(new MessageButton().setCustomId('uhg_embeds_merch').setStyle('SECONDARY').setDisabled(false).setEmoji('👕'))

      let op = ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"]
      if (content == 'rules' && op.includes(message.author.id)) uhg.dc.client.channels.cache.get('784326140227616769').send({ embeds: [embed], components: [buttons]});
      else message.channel.send({ embeds: [embed], components: [buttons] });
      return
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v rules příkazu!"
    }
  }
}

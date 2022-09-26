const { ActionRowBuilder, ButtonBuilder  } = require("discord.js");

module.exports = {
    name: "rules",
    aliases: ['pravidla'],
    permissions: [{ id: '312861502073995265', type: 'USER', permission: true }, { id: '378928808989949964', type: 'USER', permission: true }, { id: '419183469911080960', type: 'USER', permission: true }],
    platform: "dc",
    type: "message",
    run: async (uhg, message, content) => {
        let embed = { title: "**Informace Guildy**", description: "Přehled:\n⚠️ ``Pravidla guildy``\n<:elitemember:979390144153018428> ``Elite membeři``\n🎲 ``Guild eventy``\n<:botuhg:979390792747581460> ``Guild Bot (UHGuild)``\n👕 ``UHG Tričko``" }
      let buttons =  new ActionRowBuilder()
        .addComponents(new ButtonBuilder().setCustomId('embeds_pravidla')/*.setLabel('⚠️ Pravidla guildy')*/.setStyle(2).setDisabled(false).setEmoji('⚠️'))
        .addComponents(new ButtonBuilder().setCustomId('embeds_elites')/*.setLabel('Elite membeři')*/.setStyle(2).setDisabled(false).setEmoji('<:elitemember:979390144153018428>'))
        .addComponents(new ButtonBuilder().setCustomId('embeds_events')/*.setLabel('Guild eventy')*/.setStyle(2).setDisabled(false).setEmoji('🎲'))
        .addComponents(new ButtonBuilder().setCustomId('embeds_bot')/*.setLabel('Guild bot')*/.setStyle(2).setDisabled(true).setEmoji('<:botuhg:979390792747581460>'))
        .addComponents(new ButtonBuilder().setCustomId('embeds_merch').setStyle(2).setDisabled(false).setEmoji('👕'))

      let op = ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"]
      if (content == 'rules' && op.includes(message.author.id)) global.client_dc?.channels.cache.get('784326140227616769')?.send({ embeds: [embed], components: [buttons]});
      else message.channel.send({ embeds: [embed], components: [buttons] });
    }
}

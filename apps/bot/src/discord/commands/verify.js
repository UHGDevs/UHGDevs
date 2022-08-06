const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
  name: "verify",
  aliases: ["v"],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      const buttons = new MessageActionRow().addComponents(new MessageButton().setCustomId('create_modal_verify').setStyle('SECONDARY').setLabel('VERIFY'));
      const server = new MessageEmbed().setTitle('**Jak se ověřit?**').setDescription('**1.** Propoj si Discord s Hypixelem\n**2.** Klikni na button **VERIFY**').setFooter({ text: 'Video tutoriál: https://youtu.be/6BaheZBq-J0'})
      const bwserver = new MessageEmbed().setTitle('**Jak se dostat dál? **').setDescription('Abychom ověřili, že máš originální Minecraft, musíš si propojit Discord s Hypixel účtem.\n1. Připoj se na Hypixel a napiš do chatu **/discord**\n2. Zkopíruj svůj Discord tag (DavidCzPdy#7401) a vlož ho do chatu ve hře\n3. Klikni na **VERIFY** Button a pokračuj podle instrukcí\n\nPovinnost vše důkladně přečíst v <#874595365750444063> a <#874595463293198356>').setFooter({ text: 'Pokid se nic nezobrazí, kontaktuj Davida'})
      let embed = new MessageEmbed().setTitle('**UHG Verify**').setDescription('**1.** Propoj si Discord s Hypixelem\n**2.** Klikni na button **VERIFY**').setFooter({ text: 'Video tutoriál: https://youtu.be/6BaheZBq-J0'})
      if (message.author.id == '378928808989949964' && content == 'server') message.channel.send({ embeds: [server], components: [buttons]})
      else if (message.author.id == '378928808989949964' && content == 'bwserver') message.channel.send({ embeds: [bwserver], components: [buttons]})
      else message.channel.send({ embeds: [embed], components: [buttons] })
      return
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba ve verify příkazu!"
    }
  }
}

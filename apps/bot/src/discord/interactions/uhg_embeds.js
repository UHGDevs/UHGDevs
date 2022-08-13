const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

let denined =  new MessageActionRow().addComponents(new MessageButton().setCustomId('guild_denined').setLabel('ODMÍTNUTO').setStyle('DANGER').setDisabled(true))
let accepted =  new MessageActionRow().addComponents(new MessageButton().setCustomId('guild_accepted').setLabel('PŘIJATO').setStyle('SUCCESS').setDisabled(true))
let invited =  new MessageActionRow().addComponents(new MessageButton().setCustomId('guild_invited').setLabel('POZVÁNO').setStyle('PRIMARY').setDisabled(true))

module.exports = async (uhg, interaction) => {
  let type = interaction.customId.split('_')[2]
  //await interaction.update({ type:6, ephemeral: true })

  let embed;

  /* Guild Info */
  if (type == 'pravidla') embed = new MessageEmbed().setTitle("**Pravidla guildy**").setDescription("**1.** Nikomu nenadávejte a chovejte se slušně\n\n**2.** Povolené reklamy v guild chatu jsou **POUZE**: soc. sítě, SkyBlock aukce a forum posty, zbytek je na domluvě\n\n**3.** Nepište zbytečně do chatu kraviny a nespamujte commandy přes guild bota\n\n**4.** Nově příchozí hráče je dobré přivítat v guildě, aby měl lepší pocit z komunity a naopak když někdo odpojí guildu, tak upřednostněte \"F\" před \"L\"\n\n**5.** Jste-li potrestáni mutem nebo demotem a myslíte si, že je to neprávem, tak danému členovi A-teamu nenadávejte, ale v klidu to vyřešte a vysvětlete mu co se stalo nebo o co jde a jste-li na 100% přesvědčeni, že jde o omyl a daný člen A-teamu to nehodlá řešit, zeptejte se jiného admina či majitele\n\n**6.** Respektujte všechny členy guildy a obzvlášť členy A-teamu\n\n**7.** Používejte zdravý rozum a nechovejte se jako průměrný Qplay hráč")
  else if (type == 'elites') embed = new MessageEmbed().setTitle("**Elite membeři**").setDescription("➙ 10 nejlepších hráčů v GEXP za týden\n➙ konec týdne bývá v neděli kolem 17:00\n\n_Použijte /gexp v <#555832215922278401> pro zobrazení leaderboardu GEXP_")
  else if (type == 'events') embed = new MessageEmbed().setTitle("**UHG Eventy**").setDescription("Většinou jde o turnaje v různých minihrách, vše se oznamuje v <#715989905532256346>, zároveň pořádáme celoměsíční soutěž o největší počet GEXP o rank upgrade (jen VIP, VIP+, nebo MVP++) nebo o 20mil Skyblock coinů.")
  else if (type == 'bot') embed = new MessageEmbed().setTitle("**Guild Bot (UHGuild)**").setDescription("Všechny funkce:\n➙\n➙\n➙\n➙\n➙\n➙\n➙\ntu si toho dej kolik chceš")
  else if (type == 'merch') embed = new MessageEmbed().setTitle("**UHG Tričko**").setDescription("**Cena:** 549 Kč/22.49 €\n**Barva:** Modrá námořnická\n**Střih a velikost:** Dogo Premium XS, S, M, L, XL, XXL\n\n_Pro koupi trička napište <@!379640544143343618> do soukromé zprávy._").setImage('https://cdn.discordapp.com/attachments/630779313813454890/1007945792843169872/unknown.png?size=4096')

  /* Roles */
  if (type == 'guild');
  else if (type == 'discord') embed = new MessageEmbed().setTitle("****Discord Role****").setDescription("**MEE6 (Leveling) Role**\n<:dot:1003711491196854393>**LEVELY** získáte psaním si s ostatními\n<:dot:1003711491196854393>Každou minutu vám za psaní nabíhají **XP**\n<:dot:1003711491196854393>Spamováním si level moc nezvýšíte! \n\n<@&464872228819959819> ➜ **Level 10**\n<@&475594143448694787> ➜ **Level 20**\n<@&464872228996120617> ➜ **Level 30**\n<@&464872228995989515> ➜ **Level 40**\n<@&475588114732023818> ➜ **Level 50**\n<@&478809710997536768> ➜ **Level 100**\n\n**Custom Role**\n<:dot:1003711491196854393>Záleží pouze na majiteli, zda-li Vám roli dá\n<:dot:1003711491196854393>Výjimku tvoří **Server Booster**\n\n<@&575052804960288770> ➜ Kamarádi Majitele Serveru\n<@&456149770847649802> ➜ Hráči s Hypixel Youtube rankem (30k subs)\n<@&934449629800587325> ➜ Pro vybrané lidi, co mají přístup do <#912776277361053758>\n<@&684069130478813226> ➜ Pro Server Boostery\n<@&1002078147002499102> ➜ Pro ty, co si zakoupí UHG Premium (leak???)\n<@&985095284893814814> ➜ Pro lidi, co nejsou CZ/SK")
  else if (type == 'badges') embed = new MessageEmbed().setTitle("**Hypixel Badges**").setDescription("<:dot:1003711491196854393>Rozdělené na 3 úrovně podle toho, jaké máte v dané minihře statistiky:\n\nPříklad:\n<@&996682270394023996> ➜ Level 12, 1,5 KDR, 750 Wins, 1500 Kills\n<@&996682269467099138> ➜ Level 18, 2 KDR, 3000 Wins, 15000 Kills\n<@&996682265667047487> ➜ Level 24, 3.5 KDR, 8000 Wins, 35000 Kills\n_(Ranked Skywars KDR se nepočítá)_\n\n📌_``/badge`` is coming soon_").setFooter({ text: 'not woking yet' })


  if (!embed) return interaction.reply({ content: 'fatal error LOL', ephemeral: true })
  interaction.reply({ ephemeral: true, embeds: [embed] })

}

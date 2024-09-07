const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = async (uhg, interaction) => {
  let type = interaction.customId.split('_')[2]
  try { await interaction.update({ type: 6 }) } catch (e) {}

  let embed;

  /* Guild Info */
  if (type == 'pravidla') embed = {"title": "__Pravidla guildy__","color": null,"fields": [{"name": "1. Vulgarismy, toxicita a další nadávky","value": "Ke všem členům guildy se chovejte slušně,  nenadávejte jim sprostě ani jinak podobně. Udržujte úroveň chatu na vysoké úrovni"},{"name": "2. Spam a jiný odpad v chatu","value": "Zbytečně do guild chatu nepište kraviny ani nespamujte, uvažte, že sdílíte chat s dalšími 124 lidmi."},{"name": "3. Hypixel pravidla a TOS","value": "Vše co platí na Hypixelu, platí i v guildě. Pro více info se koukněte na hypixel.net/rules."},{"name": "4. Reklamy v chatu","value": "Neposílejte do guild chatu žádné self-promo ani jiný marketingový materiál bez předchozí domluvy s vedením guildy.\nVěci týkající se Hypixelu, jako jsou například Skyblock aukce, jsou povoleny."},{"name": "5. Respekt k lidem","value": "Žijeme v prostředí, kde každý může říkat svůj názor a být kým chce. Respektujte proto všechny členy guildy a především vedení, které se snaží o tuto guildu starat."},{"name": "6. Používání mozku","value": "Používejte mozek nebo jak se říká \"selský rozum\". Když není něco zakázáno, neznamená to, že to je povoleno."},{"name": "Individualita trestů","value": "Každý  přestupek hodnotíme individuálně, takže nemáme předem určené tresty. Jako trest podle závažnosti dává každý člen vedení jeden z těchto trestů:\n_-varování_\n_-mute/pauzu_\n_-kick_\n_-ban/blacklisted_"}]}
  else if (type == 'elites') embed = new MessageEmbed().setTitle("**Elite membeři**").setDescription("➙ 10 nejlepších hráčů v GEXP za týden\n➙ konec týdne bývá v neděli kolem 17:00\n\n_Použijte /gexp v <#555832215922278401> pro zobrazení leaderboardu GEXP_")
  else if (type == 'events') embed = { title: "**UHG Eventy**", description: "Většinou jde o turnaje v různých minihrách, vše se oznamuje v <#715989905532256346>, zároveň pořádáme celoměsíční soutěž o největší počet GEXP s cenou 200mil Skyblock coinů." }
  else if (type == 'bot') embed = { title: "**Guild Bot (UHGuild)**", description: "Hypixel a Discord bot <@950076450478899270> / UHGuild)\n➙Informace v <#1231692004082192427>" }
  else if (type == 'merch') embed = new MessageEmbed().setTitle("**UHG Tričko**").setDescription("**Cena:** 549 Kč/22.49 €\n**Barva:** Modrá námořnická\n**Střih a velikost:** Dogo Premium XS, S, M, L, XL, XXL\n\n_Pro koupi trička napište <@!379640544143343618> do soukromé zprávy._").setImage('https://cdn.discordapp.com/attachments/630779313813454890/1007945792843169872/unknown.png?size=4096')

  /* Roles */
  if (type == 'guild') embed = new MessageEmbed().setTitle("****Guild Role****").setDescription("<@&530504567528620063> ➜ Majitel guildy (nejvyšší hodnost)\n<@&475585340762226698> ➜ 3. stupeň vedení (největší vedení guildy, eventy, management)\n<@&537252847025127424> ➜ 2. stupeň vedení (správa guildy a vše kolem ní)\n<@&530504766225383425> ➜ 1. stupeň vedení (chat moderátor)\n<@&537255964898754571> ➜ 10 nejlepších lidí v GEXP za týden\n<@&530504032708460584> ➜ Pro všechny Guild Membery\n<@&656827910807879696> ➜ Pro lidi, co jsou v Guildě déle jak 500 dní")
  else if (type == 'discord') embed = new MessageEmbed().setTitle("****Discord Role****").setDescription("**MEE6 (Leveling) Role**\n<:dot:1003711491196854393>**LEVELY** získáte psaním si s ostatními\n<:dot:1003711491196854393>Každou minutu vám za psaní nabíhají **XP**\n<:dot:1003711491196854393>Spamováním si level moc nezvýšíte! \n\n<@&464872228819959819> ➜ **Level 10**\n<@&475594143448694787> ➜ **Level 20**\n<@&464872228996120617> ➜ **Level 30**\n<@&464872228995989515> ➜ **Level 40**\n<@&475588114732023818> ➜ **Level 50**\n<@&478809710997536768> ➜ **Level 100**\n\n**Custom Role**\n<:dot:1003711491196854393>Záleží pouze na majiteli, zda-li Vám roli dá\n<:dot:1003711491196854393>Výjimku tvoří **Server Booster**\n\n<@&575052804960288770> ➜ Kamarádi Majitele Serveru\n<@&456149770847649802> ➜ Hráči s Hypixel Youtube rankem (30k subs)\n<@&934449629800587325> ➜ Pro vybrané lidi, co mají přístup do <#912776277361053758>\n<@&684069130478813226> ➜ Pro Server Boostery\n<@&1002078147002499102> ➜ Pro ty, co si zakoupí UHG Premium (leak???)\n<@&985095284893814814> ➜ Pro lidi, co nejsou CZ/SK")
  else if (type == 'badges') embed = new MessageEmbed().setTitle("**Hypixel Badges**").setDescription("<:dot:1003711491196854393>Rozdělené na 3 úrovně podle toho, jaké máte v dané minihře statistiky:\n\nPříklad:\n<@&996682270394023996> ➜ Level 12, 750 Wins, 1500 Kills\n<@&996682269467099138> ➜ Level 18, 3000 Wins, 15000 Kills\n<@&996682265667047487> ➜ Level 24, 8000 Wins, 35000 Kills\n\n📌_``/badge`` pro více info_")
  else if (type == 'reactionrole'){
    embed = new MessageEmbed().setTitle("**Reaction Role**").setDescription("<:dot:1003711491196854393>**Ping Role**\n<:discord:1003709661335277569> ➜ <@&1003713161238679652>\n<:saturn:1012080877242687500> ➜ <@&1003713511710543952>\n<:games:1003709662941675541> ➜ <@&1003713647845052466>\n❓ ➜ <@&1015349927318139022>\n\n<:dot:1003711491196854393>**Discord Přehlednost**\n<@&936257245178634261> ➜ Filmový kroužek kanál")
    let buttons =  new MessageActionRow()
    .addComponents(new MessageButton().setCustomId(`CROLE_1003713161238679652`).setStyle('SECONDARY').setEmoji('<:discord:1003709661335277569>'))
    .addComponents(new MessageButton().setCustomId(`CROLE_1003713511710543952`).setStyle('SECONDARY').setEmoji('<:saturn:1012080877242687500>'))
    .addComponents(new MessageButton().setCustomId(`CROLE_1003713647845052466`).setStyle('SECONDARY').setEmoji('<:games:1003709662941675541>'))
    .addComponents(new MessageButton().setCustomId(`CROLE_1015349927318139022`).setStyle('SECONDARY').setEmoji('❓').setDisabled(true));
    let buttons_view =  new MessageActionRow()
    .addComponents(new MessageButton().setCustomId(`CROLE_936257245178634261`).setStyle('SECONDARY').setEmoji('🎬').setDisabled(true))
    try {
      interaction.followUp({ ephemeral: true, embeds: [embed], components: [buttons, buttons_view]})
    } catch (e) {
      try { interaction.reply({ ephemeral: true, embeds: [embed], components: [buttons, buttons_view]}) } catch(e) {}
    } 
    return
  }//.setFooter({ text: 'not woking yet' })

  if (!embed) return interaction.followUp({ content: 'fatal error LOL', ephemeral: true })
  interaction.followUp({ ephemeral: true, embeds: [embed] })

}

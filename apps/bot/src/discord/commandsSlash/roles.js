const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "roles",
  description: 'Zobrazí uhg role',
  permissions: [ {type: 'USER', id: '378928808989949964', permission: true }, {type: 'ROLE', id: '530504567528620063', permission: true, guild: '455751845319802880' }, {type: 'ROLE', id: '475585340762226698', permission: true, guild: '455751845319802880' }, {type: 'ROLE', id: '537252847025127424', permission: true, guild: '455751845319802880' }, {type: 'ROLE', id: '530504766225383425', permission: true, guild: '455751845319802880' }  ],
  options: [
    {
      name: 'visibility',
      description: 'Chceš, aby odpověď byla viditělná pro ostatní?',
      type: 'BOOLEAN',
      required: false
    }
  ],
  type: "slash",
  run: async (uhg, interaction) => {
    try {
      let ephemeral = !interaction.options.getBoolean('visibility')

      await interaction.deferReply({ ephemeral: ephemeral }).catch(() => {});
      
      let desc1 = '\`Bot Developer\`\n__Práce:__\n<:dot:1003711491196854393>Vyvíjí Discord a Minecraft bota\n<:dot:1003711491196854393>Pokud člen staffu potřebuje k práci nějakou funkci, tak mu ji obstarají v botovi\n__Zásady:__\n<:dot:1003711491196854393>\n__ Ve funkci:__\n_DavidCzPdy, Farmans_\n\n\`Designer:\`\n__Práce:__\n<:dot:1003711491196854393>Řeší vzhled MOTD ve hře\n<:dot:1003711491196854393>Navrhuje grafiku pro Discord server i bota\n<:dot:1003711491196854393>Stará se o vzhled webu\n__Zásady:__\n<:dot:1003711491196854393>Umět s photoshopem (je jedno jakým)\n<:dot:1003711491196854393>Mít vkus (preferujeme jednoduchost, ale aby to vypadalo clean)\n__ Ve funkci:__\n_Honzu_\n\n\`Personalista:\`\n__Práce:__\n<:dot:1003711491196854393>Dělá různé průzkumy mezi členy guildy\n<:dot:1003711491196854393>Snaží se s členy guildy bavit o tom, co od guildy očekávají\n<:dot:1003711491196854393>Řeší aktivitu v guildě (kickování neaktivních, řešení omluvenek)\n__Zásady:__\n<:dot:1003711491196854393>Umět mluvit s lidmi\n<:dot:1003711491196854393>Být schopen pravidelně kontrolovat aktivitu\n<:dot:1003711491196854393>Spravovat omluvenky\n__ Ve funkci:__\n_Nikdo_\n\n\`Eventer:\`\n__Práce:__\n<:dot:1003711491196854393>Realizuje guild eventy min. 1x měsíčně větší a min. 1x týdně menší\n<:dot:1003711491196854393>Pokud se jedná o eventy s výhrou, tak musí sehnat sponzora\n__Zásady:__\n<:dot:1003711491196854393>Mít čas na dělání pravidelných eventů\n<:dot:1003711491196854393>Psát do MOTD, jaký bude další velký event nebo někoho o to požádat\n<:dot:1003711491196854393>Mít nápady\n__ Ve funkci:__\n_Nikdo_\n\n\`GvG Eventer:\`\n__Práce:__\n<:dot:1003711491196854393>Domlouvá GvG (Guild vs. Guild)\n<:dot:1003711491196854393>Vybírá tým těch nejlepších z guildy\n__Zásady:__\n<:dot:1003711491196854393>Musí mít kontakty, aby mohl domlouvat GvGs s ostatními guildami\n<:dot:1003711491196854393>Měl by znát lidi v guildě, aby byl schopen sestavit tým\n<:dot:1003711491196854393>Chápat a znát minihru, která se bude hrát a nastavit pravidla hry\n__ Ve funkci:__\n_Nikdo_\n\n\`Sociální Manažer:\`\n__Práce:__\n<:dot:1003711491196854393>Stará se o soc. sítě guildy (Twitter, TikTok, Instargam, ...)\n<:dot:1003711491196854393>Propaguje guildu\n__Zásady:__\n<:dot:1003711491196854393>Být aktivní min. na 3 soc. sítích a vyznat se v nich\n<:dot:1003711491196854393>Aktivně postovat příspěvky/videa o guildě/Hypixelu všeho druhu\n<:dot:1003711491196854393>Doporučené soc.'
      let desc2 = ' sítě jsou Instagram, Twitter nebo TikTok\n__ Ve funkci:__\n_Nikdo_\n\n\`Moderátor chatu:\`\n__Práce:__\n<:dot:1003711491196854393>Dohlíží na chat v guildě\n<:dot:1003711491196854393>Rozdává muty pokud se někdo chová proti pravidlům\n<:dot:1003711491196854393>V případě, že by měl být člen kicknut, nastaví mute a řekne vyššímu staffu\n__Zásady:__\n<:dot:1003711491196854393>Být mentálně vyspělý\n<:dot:1003711491196854393>Aktivně sledovat a psát do chatu\n<:dot:1003711491196854393>Být v chatu nápomocen členům guildy\n__ Ve funkci:__\n_zmikisek, MrDodo9Riderr, Filipixx, macek2005_\n\n\`Správce Discord funkcí:\`\n__Práce:__\n<:dot:1003711491196854393>QOTD Správce, který musí denně psát nové otázky do <#1015355454882316288>\n<:dot:1003711491196854393>Movie night Správce, který pouští filmy a sestavuje Movie list\n<:dot:1003711491196854393>Hypixel Annoucement Správce, který posílá novinky a zprávy o Hypixelu\n __Zásady:__\n<:dot:1003711491196854393>Mít představivost při psaní QOTD\n<:dot:1003711491196854393>Vyznat se v filmech a snažit se je aktivně pouštět ve voice room\n<:dot:1003711491196854393>Mít rychlý přehled o Hypixel novinkách/různých oznámeních z komunity\n__ Ve funkci:__\n_0hBlood, Pavel67522_\n\n\`Beta Tester:\`\n__Práce:__\n<:dot:1003711491196854393>Na soukromém developer serveru testuje Discord bota\n__Zásady:__\n<:dot:1003711491196854393>Aktivně testovat když budete označeni na soukromém serveru\n__ Ve funkci:__\n_Nikdo_'
      return interaction.editReply({ embeds: [{
        title: "Funkce v UHG Komunitě",
        description: desc1 + desc2,
        color: 'BLUE'
      }] })
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'ROLES slash command')] })
        return "Chyba v slash roles příkazu!"
    }
  }
}

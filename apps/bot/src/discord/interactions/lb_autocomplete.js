const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = async (uhg, interaction) => {
  let game = interaction.options.getString('minigame')
  if (!game) return

  let stat = interaction.options.getString('stat')

  let focused = interaction.options._hoistedOptions.filter(n => n.focused)[0]

  if (focused.name == 'stat') {
    if (game == 'bedwars') {
      return interaction.respond([
        { name: 'Level', value: 'level' },
        { name: 'Finální Zabití', value: 'finalKills' },
        { name: 'Finální Smrti', value: 'finalDeaths' },
        { name: 'FKDR', value: 'fkdr' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'WinStreak', value: 'winstreak' },
        { name: 'Hry', value: 'games' },
        { name: 'EXP', value: 'xp' },
        { name: 'Mince', value: 'coins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Postele', value: 'bedsBroken' },
        { name: 'Ztracené Postele', value: 'bedsLost' },
        { name: 'BBLR', value: 'bblr' },
        { name: 'Sebrané Irony', value: 'iron' },
        { name: 'Sebrané Goldy', value: 'gold' },
        { name: 'Sebrané Diamanty', value: 'diamond' },
        { name: 'Sebrané Emeraldy', value: 'emerald' },
      ]);
    } else if (game == 'skywars') {
      return interaction.respond([
        { name: 'Level', value: 'level' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'Hry', value: 'games' },
        { name: 'Mince', value: 'coins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Hlavy', value: 'heads' },
        { name: 'Opály', value: 'opals' },
        { name: 'Duše', value: 'souls' },
        { name: 'Tokeny', value: 'tokens' },
        { name: 'Asistence', value: 'assists' }
      ])
    } else if (game == 'general') {
      return interaction.respond([
        { name: 'Level', value: 'level' },
        { name: 'Karma', value: 'karma' },
        { name: 'AP', value: 'aps' },
        { name: 'Legacy AP', value: 'legacyAps' },
       // { name: 'Wins', value: 'wins' },
        { name: 'Ranks Gifted', value: 'ranksGiven' },
        { name: 'Gifts Gifted', value: 'giftsGiven' },
        { name: 'Quests', value: 'quests' },
        { name: 'Challenges', value: 'challenges' },
        { name: 'Classic Tokeny', value: 'legacyTokens' }
      ])
    } else if (game == 'arena') {
      return interaction.respond([
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Mince', value: 'coins' },
        { name: 'Klíče', value: 'keys' },
        { name: 'WinStreak', value: 'winstreak' }
      ])
    } else if (game == 'murder') {
      return interaction.respond([
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'Hry', value: 'games' },
        { name: 'Mince', value: 'coins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Hero Výhry', value: 'herowins' },
        { name: 'Detektiv Výhry', value: 'detectivewins' },
        { name: 'Murderer Výhry', value: 'murdererwins' },
        { name: 'Survivor Výhry', value: 'survivorwins' },
      //  { name: 'Zabití za Survivora', value: 'survivorkills' },
      //  { name: 'Zabití za Zombie', value: 'zombiekills' }
      ])
    } else if (game == 'tkr') {
      return interaction.respond([
        { name: 'Trofeje', value: 'trophies' },
        { name: 'Zlata', value: 'gold' },
        { name: 'Stříbra', value: 'silver' },
        { name: 'Bronzy', value: 'bronze' },
        { name: 'Mince', value: 'coins' },
        { name: 'Sebrané Boxy', value: 'collectedboxes' },
        { name: 'Sebrané Mince', value: 'collectedcoins' },
        { name: 'Kola', value: 'laps' }
      ])
    } else if (game == 'duels') {
      return interaction.respond([
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'Hry', value: 'games' },
        { name: 'Mince', value: 'coins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'WinStreak', value: 'winstreak' },
        { name: 'Best WinStreak', value: 'bestwinstreak' },
        { name: 'Loot Bedny', value: 'lootchests' }
      ])
    } else if (game == 'quake') {
      return interaction.respond([
        { name: 'Výhry', value: 'wins' },
        { name: 'Hry', value: 'games' },
        { name: 'Mince', value: 'coins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'HeadShots', value: 'headshots' },
        { name: 'Best KillStreak', value: 'bestkillstreak' }
      ])
    } else if (game == 'ww') {
      return interaction.respond([
        { name: 'Level', value: 'level' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'Hry', value: 'games' },
        { name: 'Mince', value: 'coins' },
        { name: 'Layery', value: 'layers' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Assisty', value: 'assists' },
        { name: 'Vln zničeno', value: 'blocks_broken' },
        { name: 'Vln položeno', value: 'blocks_placed' },
        { name: 'Powerupů sebráno', value: 'powerups'},
      ])
    } else if (game == 'bb') {
      return interaction.respond([
        { name: 'Skóre', value: 'score' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Mince', value: 'coins' }
      ])
    } else if (game == "paintball") {
      return interaction.respond([
        { name: 'Mince', value: 'coins' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Killstreaks', value: 'killstreaks' },
        { name: 'Střel vystřeleno', value: 'shots' }
      ])
    } else if (game == "walls") {
      return interaction.respond([
        { name: 'Mince', value: 'coins' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Prohry', value: 'losses' },
        { name: 'WLR', value: 'wlr' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Asistence', value: 'assists' }
      ])
    } else if (game == "vampirez") {
      return interaction.respond([
        { name: 'Mince', value: 'coins' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Výhry za člověka', value: 'humnanwins' },
        { name: 'Výhry za upíra', value: 'vampirewins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Lidí zabito', value: 'humankills' },
        { name: 'Upírů zabito', value: 'vampirekills' },
        { name: 'Zombie zabito', value: 'zombiekills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'Smrti za člověka', value: 'humnandeaths' },
        { name: 'Smrti za upíra', value: 'vampiredeaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Zlata nakoupeno', value: 'goldbought' }
      ])
    } else if (game == "cac") {
      return interaction.respond([
        { name: 'Mince', value: 'coins' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Výhry kol', value: 'roundwins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Zabití do hlavy', value: 'headshotkills' },
        { name: 'Zabití granátem', value: 'grenadekills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Asistence', value: 'assists' },
        { name: 'Střely', value: 'shots' },
        { name: 'Položené bomby', value: 'bombsplanted' },
        { name: 'Zneškodněné bomby', value: 'bombsdefused' },
      ])
    } else if (game == 'blitz') {
      return interaction.respond([
        { name: 'Mince', value: 'coins' },
        { name: 'Výhry', value: 'wins' },
        { name: 'Zabití', value: 'kills' },
        { name: 'Smrti', value: 'deaths' },
        { name: 'KDR', value: 'kdr' },
        { name: 'Poškození', value: 'damage' },
      ])
    }
  } else if (focused.name == 'gamemode') {
    if (!stat) return
    if (game == 'bedwars') {
      if (stat == 'coins' || stat == 'exp' || stat == 'level') return interaction.respond([{ name: 'Celkové', value: 'overall' }])
      return interaction.respond([
        { name: 'Celkové', value: 'overall' },
        { name: 'Solo', value: 'solo' },
        { name: 'Doubles', value: 'doubles' },
        { name: '3v3v3v3', value: 'threes' },
        { name: '4v4v4v4', value: 'fours' },
        { name: '4v4', value: '4v4' }
      ]);
    } else if (game == 'skywars') {
      if (stat == 'coins' || stat == 'heads' || stat == 'level' || stat == 'opals' || stat == 'shards' || stat == 'tokens') return interaction.respond([{ name: 'Celkové', value: 'overall' }])
      return interaction.respond([
        { name: 'Celkové', value: 'overall' },
        { name: 'Solo Normal', value: 'solo_normal' },
        { name: 'Solo Insane', value: 'solo_insane' },
        { name: 'Doubles Normal', value: 'doubles_normal' },
        { name: 'Doubles Insane', value: 'doubles_insane' },
        { name: 'Rankedy', value: 'ranked' }
      ]);
    } else if (game == 'arena') {
      if (stat == 'keys' || stat == 'coins') return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
      return interaction.respond([
        { name: 'Celkové', value: 'overall' },
        { name: 'Solo', value: 'solo' },
        { name: 'Doubles', value: 'doubles' },
        { name: 'Fours', value: 'fours' }
      ])
    } else if (game == 'murder') {
      if (stat == 'herowins' || stat == 'coins' || stat == 'detectivewins' || stat == 'murdererwins') return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
      if (stat == 'survivorwins') return interaction.respond([ { name: 'Infection', value: 'infection' } ]);
      return interaction.respond([
        { name: 'Celkové', value: 'overall' },
        { name: 'Classic', value: 'classic' },
        { name: 'Double Up', value: 'doubleup' },
        { name: 'Assassins', value: 'assassins' },
        { name: 'Infection', value: 'infection' }
      ])
    } else if (game == 'cac') {
      if (stat == 'coins' || stat == 'shots' || stat == 'grenadekills' || stat == 'headshotkills' || stat == 'roundwins') return interaction.respond([{name: 'Celkové', value: 'overall'}]);
      if (stat == 'bombsdefused' || stat == 'bombsplanted') return interaction.respond([{name: 'Defusal', value: 'defusal'}]);
      return interaction.respond([
        { name: 'Celkové', value: 'overall' },
        { name: 'Defusal', value: 'defusal' },
        { name: 'Team Deathmatch', value: 'deathmatch' },
        { name: 'Gun Game', value: 'gungame' }
      ])
    } else if (game == 'general') {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == 'tkr') {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == 'duels') {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == 'quake') {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == "ww") {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == "bb") {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == "paintball") {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == "walls") {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == "vampirez") {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    } else if (game == "blitz") {
      return interaction.respond([ { name: 'Celkové', value: 'overall' } ]);
    }
  }
}

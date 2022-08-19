
class ApiFunctions {

  static f(number, max=2) {
    if (!Number(number)) return number
    return Number(number).toLocaleString('en', {minimumFractionDigits: 0, maximumFractionDigits: max})
  }

  static ratio(n1=0, n2=0, n3=2) {
    let options = {minimumFractionDigits: 0, maximumFractionDigits: n3};
    return Number(Number(isFinite(n1 / n2) ? + (n1 / n2) : n1).toLocaleString('en', options))
  }

  static romanize(num) {
    if (num == 0) return 0
    var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
    for ( i in lookup ) {
      while ( num >= lookup[i] ) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  }

  static toTime(sec, ms=false) {
    if (ms) sec = sec/1000
    let days = sec / 60 / 60 / 24
    let hours = sec / 60 / 60 % 24
    let formatted = `${Math.floor(Number(days))}d ${Math.floor(Number(hours))}h`
    let final = {formatted:formatted, h:sec/60/60, d: sec/60/60/24, m: sec/60, s: sec}
    return final
  }

  static getNwLevel(exp) { return Math.sqrt(Number(exp) * 2 + 30625) / 50 - 2.5 }

  static getRank(json) {
    function replaceRank (rank) { return rank.replace(/§.|\[|]/g, '').replace('SUPERSTAR', "MVP++").replace('VIP_PLUS', 'VIP+').replace('MVP_PLUS', 'MVP+').replace('NONE', 'MVP+').replace("GAME_MASTER", "GM").replace("YOUTUBER", "YOUTUBE").replace("OWNER", "OWNER").replace("EVENTS", "EVENTS").replace("MOJANG", "MOJANG").replace("ADMIN", "ADMIN")}
    let rank = json.prefix || json.rank || json.monthlyPackageRank || json.packageRank || json.newPackageRank || false
    if (!rank) return {rank: "NON", prefix: json.displayname}
    return { rank: replaceRank(rank), prefix: `[${replaceRank(rank)}] ${json.displayname}` }
  }

  static getPlusColor(rank, plus) {
    if (plus == undefined || rank == 'PIG+++' || rank == "OWNER" || rank == "ADMIN" || rank == "GM") {
      var rankColor = {
        'MVP': { mc: '§b', hex: '#55FFFF' },
        'MVP+': { mc: '§c', hex: '#FF5555' },
        'MVP++': { mc: '§c', hex: '#FFAA00' },
        'VIP+': { mc: '§a', hex: '#55FF55' },
        'VIP': { mc: '§a', hex: '#55FF55' },
        'PIG+++': { mc: '§d', hex: '#FF55FF' },
        'OWNER': { mc: '§c', hex: '#FF5555' },
        'ADMIN': { mc: '§c', hex: '#FF5555' },
        'GM': { mc: '§2', hex: '#00AA00' },
      }[rank]
      if (!rankColor) return { mc: '§7', hex: '#BAB6B6' }
    } else {
      var rankColorMC = {
        RED: { mc: '§c', hex: '#FF5555' },
        GOLD: { mc: '§6', hex: '#FFAA00' },
        GREEN: { mc: '§a', hex: '#55FF55' },
        YELLOW: { mc: '§e', hex: '#FFFF55' },
        LIGHT_PURPLE: { mc: '§d', hex: '#FF55FF' },
        WHITE: { mc: '§f', hex: '#F2F2F2' },
        BLUE: { mc: '§9', hex: '#5555FF' },
        DARK_GREEN: { mc: '§2', hex: '#00AA00' },
        DARK_RED: { mc: '§4', hex: '#AA0000' },
        DARK_AQUA: { mc: '§3', hex: '#00AAAA' },
        DARK_PURPLE: { mc: '§5', hex: '#AA00AA' },
        DARK_GRAY: { mc: '§8', hex: '#555555' },
        BLACK: { mc: '§0', hex: '#000000' },
        DARK_BLUE: { mc: '§1', hex: '#0000AA'}
      }[plus]
      if (!rankColorMC) return { mc: '§7', hex: '#BAB6B6' }
    }
    return rankColor || rankColorMC;
  }

  static getBwExpForLevel(level) {
    var progress = level % 100
    if (progress > 3) return 5000;
    return {
      0: 500,
      1: 1000,
      2: 2000,
      3: 3500
    }[progress]
  }

  static getBwLevel(exp = 0) {
    var prestiges = Math.floor(exp / 487000);
    var level = prestiges * 100;
    var remainingExp = exp - (prestiges * 487000);

    for (let i = 0; i < 4; ++i) {
        var expForNextLevel = this.getBwExpForLevel(i)
        if (remainingExp < expForNextLevel) break;
        level++
        remainingExp -= expForNextLevel
    }

    return parseFloat((level + (remainingExp / 5000)).toFixed(2))
  }

  static getWwLevel(exp = 0) {
    let level = 0;
    let xpleft = 0;
    let hundred = Math.floor(exp / 485000)
    if (exp - 485000 * hundred < 10000) {
      let o = 0;
      let finalexp = 0;
      let levels = {0: 1000, 1: 2000, 2: 3000, 3: 4000}
      for (let i = 0; i<4; i++) {
        if (exp - 485000 * hundred > 0) {
          exp = exp - 485000 * hundred - levels[i]
          level++
          o = levels[i]
          finalexp = exp + levels[i]
        }
        else break
      }
      level += hundred * 100 + finalexp / o
      xpleft = (1 - finalexp / o)*o
    }
    else {
      let x = ((exp - 485000 * hundred) - 10000) / 5000 + 5
      level = hundred * 100 + x
      xpleft = 5000-((level - Math.floor(level))*5000)
    }
    return {level: level, levelformatted: Math.floor(level), xpleft: xpleft}
  }
  
  static getCaC(score) {
    let title = 'Gray'
    if (score >= 100000) title = 'Red';
    else if (score >= 50000) title = 'Dark Aqua';
    else if (score >= 20000) title = 'Gold';
    else if (score >= 5000) title = 'Yellow';
    else if (score >= 2500) title = 'White';

    return title
  }

  static getBuildBattle(score) {
    let title = 'Rookie'

    if (score >= 20000) title = 'Master';
    else if (score >= 15000) title = 'Expert';
    else if (score >= 10000) title = 'Professional';
    else if (score >= 7500) title = 'Talented';
    else if (score >= 5000) title = 'Skilled';
    else if (score >= 3500) title = 'Trained';
    else if (score >= 2000) title = 'Seasoned';
    else if (score >= 1500) title = 'Experienced';
    else if (score >= 500) title = 'Apprentice';
    else if (score >= 250) title = 'Amateur';
    else if (score >= 100) title = 'Untrained';

    return title
  }

  static getSpeedUHCPerk(perk) {
    if (!perk || perk == "None") return "None"
    perk = perk.split("_")
    perk.shift()
    for (let i in perk) {
      perk[i] = this.capitalize(perk[i]);
    }
    return perk.join(' ')
  }

  static getSpeedUHC(score) {
    let stars = 1

    if (score >= 85550) stars = 10;
    else if (score >= 55550) stars = 9;
    else if (score >= 30550) stars = 8;
    else if (score >= 15550) stars = 7;
    else if (score >= 5550) stars = 6;
    else if (score >= 2560) stars = 5;
    else if (score >= 1050) stars = 4;
    else if (score >= 300) stars = 3;
    else if (score >= 50) stars = 2;

    return stars
  }

  static getUHC(score) {
    let stars = 1
    if (score >= 25210) stars = 15;
    else if (score >= 22210) stars = 14;
    else if (score >= 19210) stars = 13;
    else if (score >= 16210) stars = 12;
    else if (score >= 13210) stars = 11;
    else if (score >= 10210) stars = 10;
    else if (score >= 5210) stars = 9;
    else if (score >= 2710) stars = 8;
    else if (score >= 1710) stars = 7;
    else if (score >= 960) stars = 6;
    else if (score >= 460) stars = 5;
    else if (score >= 210) stars = 4;
    else if (score >= 60) stars = 3;
    else if (score >= 10) stars = 2;

    return stars
  }

  static getSwLevel(xp) {
    var xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];
    var exactLevel = 0
    if (xp >= 15000) {
          exactLevel = (xp - 15000) / 10000 + 12;
      } else {
        for (let i = 0; i < xps.length; i++) {
          if (xp < xps[i]) {
            exactLevel = i + (xp - xps[i-1]) / (xps[i] - xps[i-1]);
            break;
          }
        }
      }
    return exactLevel;
  }

  static getSwExpLeft(xp) {
    var xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000]
    if (xp >= 15000) return 10000 - ((xp - 15000) % 10000)
    else {
      for (let i=0; i < xps.length; i++){
        if (xp < xps[i]) return Number((xp - xps[i]) / -1)
      }
    }
  }

  static getGamemode(mode) {
    if (!mode) return
    return mode
        .replace(/bedwars_eight_one/g, "Bed Wars Solo")
        .replace(/bedwars_eight_two/g, "Bed Wars Doubles")
        .replace(/bedwars_four_three/g, "Bed Wars 3s")
        .replace(/bedwars_four_four/g, "Bed Wars 4s")
        .replace(/bedwars_two_four/g, "Bed Wars 4v4")
        .replace(/bedwars_castle/g, "Bed Wars Castle 40v40")
        .replace(/bedwars_four_four_armed/g, "Bed Wars Armed 4s")
        .replace(/bedwars_eight_two_armed/g, "Bed Wars Armed Doubles")
        .replace(/bedwars_four_four_voidless/g, "Bed Wars Voidless 4s")
        .replace(/bedwars_eight_two_voidless/g, "Bed Wars Voidless Doubles")
        .replace(/bedwars_four_four_lucky/g, "Bed Wars Lucky Blocks 4s")
        .replace(/bedwars_eight_two_lucky/g, "Bed Wars Lucky Blocks Doubles")
        .replace(/bedwars_eight_two_ultimate/g, "Bed Wars Ultimate Doubles")
        .replace(/bedwars_four_four_ultimate/g, "Bed Wars Ultimate 4s")
        .replace(/bedwars_four_four_rush/g, "Bed Wars Rush 4s")
        .replace(/bedwars_eight_two_rush/g, "Bed Wars Rush Doubles")

        .replace(/skywars_solo_normal/g, "SkyWars Solo Normal")
        .replace(/skywars_solo_insane/g, "SkyWars Solo Insane")
        .replace(/skywars_teams_normal/g, "SkyWars Teams Normal")
        .replace(/skywars_teams_insane/g, "SkyWars Teams Insane")
        .replace(/skywars_ranked/g, "Ranked SkyWars")
        .replace(/skywars_normalmega/g, "SkyWars Mega")
        .replace(/skywars_doublesmega/g, "SkyWars Doubles Mega")
        .replace(/skywars_lab/g, "SkyWars Laboratory")

        .replace(/murder_classic/g, "Murder Mystery Classic")
        .replace(/murder_double_up/g, "Murder Mystery Double Up!")
        .replace(/murder_showdown/g, "Murder Mystery Showdown")
        .replace(/murder_infection/g, "Murder Mystery Infection")
        .replace(/murder_hardcore/g, "Murder Mystery Hardcore")
        .replace(/murder_assassins/g, "Murder Mystery Assassins")

        .replace(/_/g, " ")
  }

  static renameHypixelGames(game){
    if (game === null || game === undefined) return
    else {
      return game.toLowerCase()
      .replace("skywars", "SkyWars")
      .replace("bedwars", "BedWars")
      .replace("gingerbread", "TKR")
      .replace("mcgo", "Cops & Crims")
      .replace("super_smash", "Smash Heroes")
      .replace("skyblock", "SkyBlock")
      .replace("murder_mystery", "Murder Mystery")
      .replace("legacy", "Classic Games")
      .replace("survival_games", "Blitz SG")
      .replace("uhc", "UHC")
      .replace("speed_uhc", "Speed UHC")
      .replace("tntgames", "TNT Games")
      .replace("pit", "The Hypixel Pit")
      .replace("arcade", "Arcade Games")
      .replace("walls3", "Mega Walls")
      .replace("arena", "Arena Brawl")
      .replace("vampirez", "VampireZ")
      .replace("walls", "The Walls")
      .replace("battleground", "Warlords")
      .replace("build_battle", "Build Battle")
      .replace("bb", "Build Battle")
      .replace("ww", "Wool Wars")
      .replace("wool_wars", "Wool Wars")
      .replace("wool_games", "Wool Wars")
      .replace("tkr", "TKR")
      .replace("bw", "BedWars")
      .replace("sw", "SkyWars")
    }
  }

  static getStatus(status) {
    if (!status) return
    return status.toLowerCase()
        .replace("dynamic", "Private Island")
        .replace("hub", "Hub")
        .replace("dungeon hub", "Dungeon Hub")
        .replace("combat 1", "Spider's Den")
        .replace("combat 2", "Blazing Fortress")
        .replace("combat 3", "The End")
        .replace("foraging 1", "The Park")
        .replace("farming 1", "Farming Islands")
        .replace("mining 1", "Gold Mine")
        .replace("mining 2", "Deep Caverns")
        .replace("mining 3", "Dwarven Mines")
        .replace("crystal hollows", "Crystal Hollows")
        .replace("dungeon", "Catacombs")
        .replace("dark auction", "Dark Auction")
        .replace("crimson isle", "Crimson Isle")

        .replace("pit", "")
        .replace("housing", "Housing")
  }

  static sbMode(mode) {
    if (!mode) return 'Normal'
    return mode.toLowerCase()
          .replace('island', 'Stranded')
          .replace('bingo', 'Bingo')
          .replace('ironman', 'Ironman')
  }


  static capitalize(string) {
    if (!string) return string
    return String(string)[0].toUpperCase() + String(string).slice(1);
  }

  static clear(message) { return message.replace(/✫|✪|⚝/g, '?').replace(/§|¡±/g, '�').replace(/�[0-9A-FK-OR]/gi, '') }
}

module.exports = ApiFunctions

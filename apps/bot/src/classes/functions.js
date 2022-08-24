const constants = require('../settings/values/skyblockconstants')
const { Collection } = require('discord.js');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter

module.exports = class Functions extends EventEmitter {
  constructor() {
    super()
    this.getApi = require("../utils/api")

    this.getBadgeRoles = (name, api) => {
      let info = this.badges ? this.badges.find(n => n.name == name) : null
      if (!info) return {}
      let stats = info.stats.map(n => this.path(info.path+n, api))
      stats = stats.map((n, i) => {
          if (n < info.req[i][0]) return -1
          else if (n < info.req[i][1]) return 0
          else if (n < info.req[i][2]) return 1
          else return 2
      })
      let role_i = Math.min(...stats)
      let stat_role = role_i >= 0 ? info.roles[role_i] : {}
      return {name: info.name, role: stat_role.id ? stat_role : 'Žádná role', delete: info.roles.filter(n => n.id !== stat_role.id )}
    }
  }

  getDiscordIds() {return JSON.parse(fs.readFileSync('src/settings/discord.json', 'utf8'));}

  delay(ms) {return new Promise(res => setTimeout(res, ms))}

  clear(message) { return message.replace(/✫|✪|⚝/g, '?').replace(/§|¡±/g, '�').replace(/�[0-9A-FK-OR]/gi, '') }

  capitalize(string) {
    if (!string) return string
    return String(string)[0].toUpperCase() + String(string).slice(1);
  }

  startsWithArray(str, array) {
    return array.some(n => str.startsWith(n));
  }

  includesWithArray(str, array) {
    return array.some(n => str.includes(n));
  }

  endsWithArray(str, array) {
    return array.some(n => str.endsWith(n));
  }

  f(number, max=2) {
    if (!Number(number)) return number
    return Number(number).toLocaleString('en', {minimumFractionDigits: 0, maximumFractionDigits: max})
  }

  money(n) {
    if (!Number(n)) return n
    if (n<1000) return n
    else if (n>=1000 && n<1000000) return Math.floor(n/100)/10 + "K"
    else if (n>=1000000 && n<1000000000) return Math.floor(n/10000)/100 + "M"
    else return Math.floor(n/10000000)/100 + "B"
  }

  r(n){
    try {Number(n)} catch {return n}
    console.log(n)
    let d = String(n).length
    let s;
    d = Math.pow(10,d)
    let i=7
    while(i)(s=Math.pow(10,i--*3))<=n&&(n=Math.floor(Math.round(n*d/s)/d)+"kMGTPE"[i])
    return n
  }

  ratio(n1=0, n2=0, n3=2) {
    var options = {minimumFractionDigits: 0, maximumFractionDigits: n3};
    return Number(Number(isFinite(n1 / n2) ? + (n1 / n2) : n1).toLocaleString('en', options))
  }

  romanize(num) {
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

  toTime(sec, ms=false) {
    if (ms) sec = sec/1000
    let days = sec / 60 / 60 / 24
    let hours = sec / 60 / 60 % 24
    let formatted = `${Math.floor(Number(days))}d ${Math.floor(Number(hours))}h`
    let final = {formatted:formatted, h:sec/60/60, d: sec/60/60/24, m: sec/60, s: sec}
    return final
  }

  getMilestones(first, second) {
    if (second == 0) return {next: Math.ceil(first), need: 1}
    return {next: Math.ceil(first/second), need: Math.ceil(first/second) * second - first}
 }

  getNwLevel(exp) { return Math.sqrt(Number(exp) * 2 + 30625) / 50 - 2.5 }

  getSwLevel(xp) {
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

  getSwExpLeft(xp) {
    var xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000]
    if (xp >= 15000) return 10000 - ((xp - 15000) % 10000)
    else {
      for (let i=0; i < xps.length; i++){
        if (xp < xps[i]) return Number((xp - xps[i]) / -1)
      }
    }
  }

  getRankedPosition(pos) {
    if (pos == 0) return ""
    else if ( pos > 1 && pos <= 10) return "Masters"
    else if ( pos > 10 && pos <= 200) return "Diamond"
    else if ( pos > 200 && pos <= 1500) return "Gold"
    else if ( pos > 1500 && pos <= 5000) return "Iron"
    else if ( pos > 5000 && pos <= 20000) return "Stone"
    else if ( pos > 20000 && pos <= 50000) return "Wood"
    else return ""
  }

  getBwLevel(exp = 0) {
    function getBwExpForLevel(level) {
      var progress = level % 100
      if (progress > 3) return 5000;
      return {
        0: 500,
        1: 1000,
        2: 2000,
        3: 3500
      }[progress]
    }
    var prestiges = Math.floor(exp / 487000);
    var level = prestiges * 100;
    var remainingExp = exp - (prestiges * 487000);

    for (let i = 0; i < 4; ++i) {
        var expForNextLevel = getBwExpForLevel(i)
        if (remainingExp < expForNextLevel) break;
        level++
        remainingExp -= expForNextLevel
    }

    return parseFloat((level + (remainingExp / 5000)).toFixed(2))
  }

  getWwLevel(exp = 0) {
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

  getPitPrestige(xp) {
    var xps = [1.1, 1.2]
  }

  getGuildLevel(exp) {
    const EXP_NEEDED = [ 100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 2500000, 2500000, 2500000, 2500000, 3000000];
    let level = 0;
    for (let i = 0; i <= 1000; i += 1) {
      let need = 0;
      if (i >= EXP_NEEDED.length) {
        need = EXP_NEEDED[EXP_NEEDED.length - 1];
      } else { need = EXP_NEEDED[i]; }
      if ((exp - need) < 0) {
        return level + (exp / need);
      }
      level += 1;
      exp -= need;
    }
    return 1000;
  }
  ggl(exp) {
  const EXP_NEEDED = [3000000];
  let level = 0;
  for (let i = 0; i <= 1000; i += 1) {
    let need = 0;
    if (i >= EXP_NEEDED.length) {
      need = EXP_NEEDED[EXP_NEEDED.length - 1];
    } else { need = EXP_NEEDED[i]; }
    if ((exp - need) < 0) {
      return level + (exp / need);
    }
    level += 1;
    exp -= need;
  }
  return 1000;
}

  getOnline(json) {
    let online = {}
    function renameHypixelGames(game){
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

    function getGameMode(gamemode) {
      if (gamemode === null || gamemode === undefined) return
      else {
        return gamemode.toLowerCase()
          .replace(/bedwars_eight_one/g, "BedWars Solo")
          .replace(/bedwars_eight_two/g, "BedWars Doubles")
          .replace(/bedwars_four_three/g, "BedWars 3s")
          .replace(/bedwars_four_four/g, "BedWars 4s")
          .replace(/bedwars_two_four/g, "BedWars 4v4")
          .replace(/_/g, " ")
      }
    }
    let game = renameHypixelGames(json.gameType || null)
    let mode = getGameMode(json.mode || null)
    online.title = "Online"
    online.game = game
    if (mode == "LOBBY") {
      online.modtitle = "Mode"
      online.footer = `Je v ${game} Lobby`
      online.type = `${game} Lobby`
      online.mode = mode
    } else if (game == "replay"){
      online.footer = `Sleduje replay`
    } else {
      if (game == "SkyBlock") online.modtitle = "SkyBlock Místo"
      else online.modtitle = "Mode"
      online.footer = `Hraje ${game}`
      online.type = game
      online.map = json.map || null
      online.mode = mode
    }
    return online
  }

  getSlayerLvl(xp, slayer) {
    //return 0
    let zombiexp = [5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000]
    let spiderxp = [5, 25, 200, 1000, 5000, 20000, 100000, 400000, 1000000]
    let wolfemanblazexp = [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000]
    for (let i = 0; i < 9; i++) {
      if (slayer == "zombie") {
        if (xp < zombiexp[i]) {
          return i
        }
      }
      else if (slayer == "spider") {
        if (xp < spiderxp[i]) {
          return i
        }
      }
      else if (slayer == "wolf" || slayer == "eman" || slayer == "blaze") {
        if (xp < wolfemanblazexp[i]) {
          return i
        }
      }
    }
    return 9;
  }

  getHotmTier(exp) {
    let tiers = [0, 3000, 12000, 37000, 97000, 197000, 347000]
    for (let i=0; i<7; i++) {
      if (exp < tiers[i]) {
        return i
      }
    }
    return 7
  }

  getCataLvl(exp) {
    if (exp >= 569809640) return 50
    let levels = {'1': 50, '2': 125, '3': 235, '4': 395, '5': 625, '6': 955, '7': 1425, '8': 2095, '9': 3045, '10': 4385, '11': 6275, '12': 8940, '13': 12700, '14': 17960, '15': 25340, '16': 35640, '17': 50040, '18': 70040, '19': 97640, '20': 135640, '21': 188140, '22': 259640, '23': 356640, '24': 488640, '25': 668640, '26': 911640, '27': 1239640, '28': 1684640, '29': 2284640, '30': 3084640, '31': 4149640, '32': 5559640, '33': 7459640, '34': 9959640, '35': 13259640, '36': 17559640, '37': 23159640, '38': 30359640, '39': 39559640, '40': 51559640, '41': 66559640, '42': 85559640, '43': 109559640, '44': 139559640, '45': 177559640, '46': 225559640, '47': 285559640, '48': 360559640, '49': 453559640, '50': 569809640}
    for (let i=1;i<=50;i++) {
      if (exp <= levels[i]) return i - 1
    }
    return 0
  }

  getLevelByXp(xp, type, levelCap) {
    let xpTable;
    switch (type) {
      case 'runecrafting':
        xpTable = constants.runecrafting_xp;
        break;
      case 'dungeons':
        xpTable = constants.dungeon_xp;
        break;
      case 'social':
        xpTable = constants.social_xp;
        break;
      default:
        xpTable = constants.leveling_xp;
    }
    let maxLevel = Math.max(...Object.keys(xpTable));
    if (constants.skills_cap[type] > maxLevel) {
      xpTable = Object.assign(constants.xp_past_50, xpTable);
      maxLevel = typeof levelCap === 'number' ?
        maxLevel + levelCap :
        Math.max(...Object.keys(xpTable));
    }
    if (isNaN(xp)) {
      return {
        xp: 0,
        level: 0,
        maxLevel,
        xpCurrent: 0,
        xpForNext: xpTable[1],
        progress: 0
      };
    }
    let xpTotal = 0;
    let level = 0;
    let xpForNext = 0;
    for (let x = 1; x <= maxLevel; x++) {
      xpTotal += xpTable[x];
      if (xpTotal > xp) {
        xpTotal -= xpTable[x];
        break;
      } else {
        level = x;
      }
    }
    const xpCurrent = Math.floor(xp - xpTotal);
    if (level < maxLevel) xpForNext = Math.ceil(xpTable[level + 1]);
    const progress = Math.floor((Math.max(0, Math.min(xpCurrent / xpForNext, 1))) * 100);
    return level /* {
      xp,
      level,
      maxLevel,
      xpCurrent,
      xpForNext,
      progress
    }; */
  }

  getCrimson(quests = []) {
    if (quests.length) {
      let fancyquests = []
      for (let i in quests) {
        let quest = quests[i].split("_")
        let quantity = 1
        let rarity = (quest[quest.length-1]).toUpperCase()
        if (quest[2] == "kill") {
          let boss;
          if (rarity == "A") quantity = 2
          else if (rarity == "S") quantity = 3
          switch (quest[3]) {
            case "ashfang":
              boss = "Ashfang"
              break
            case "bladesoul":
              boss = "Bladesoul"
              break
            case "magma":
              boss = "Magma Boss"
              break
            case "barbarian":
              boss = "Barbarian Duke X"
              break
            case "mage":
              boss = "Mage Outlaw"
              break
          }
          fancyquests.push(`(${rarity}) ${quantity}x ${boss}`)
        }
        else if (quest[2] == "fight") {
          let type;
          switch (quest[4]) {
            default:
              type = "Basic"
              break
            case "hot":
              type = "Hot"
              break
            case "burning":
              type = "Burning"
              break
            case "fiery":
              type = "Fiery"
            case "infernal":
              type = "Infernal"
          }
          fancyquests.push(`(${rarity}) ${type} Kuudra`)
        }
        else if (quest[2] == "dojo") {
          let type;
          let difficulty = (quest[quest.length-2])[0].toUpperCase()
          switch (quest[5]) {
            case "snake":
              type = "Swiftness"
              break
            case "archer":
              type = "Mastery"
              break
            case "sword":
              type = "Discipline"
              break
            case "wall":
              type = "Stamina"
              break
            case "mob":
              type = "Force"
              break
            case "fireball":
              type = "Tenacity"
              break
            default:
              type = "Control"
              break
          }
          fancyquests.push(`(${rarity}) ${type} Rank ${difficulty}`)
        }
        else if (quest[2] == "rescue") fancyquests.push(`(${rarity}) Rescue Mission`)
        else if (quest[2] == "fetch") {
          let material = quest[3].charAt(0).toUpperCase() + quest[3].slice(1)
          //WIP
          fancyquests.push(`(${rarity}) undefinedx ${material}`)
        }
        else if (quest[2]) {
          fancyquests.push(`(${rarity}) undefinedx ${quest[2].charAt(0).toUpperCase() + quest[2].slice(1)}`)
        } //WIP
      }
      return fancyquests
    } return "None"
  }

  getSpeedUHCPerk(perk) {
    if (!perk || perk == "None") return "None"
    perk = perk.split("_")
    perk.shift()
    for (let i in perk) {
      perk[i] = this.capitalize(perk[i]);
    }
    return perk.join(' ')
  }

  getRank(json) {
    function replaceRank (rank) { return rank.replace(/§.|\[|]/g, '').replace('SUPERSTAR', "MVP++").replace('VIP_PLUS', 'VIP+').replace('MVP_PLUS', 'MVP+').replace('NONE', 'MVP+').replace("GAME_MASTER", "GM").replace("YOUTUBER", "YOUTUBE").replace("OWNER", "OWNER").replace("EVENTS", "EVENTS").replace("MOJANG", "MOJANG").replace("ADMIN", "ADMIN")}
    let rank = json.prefix || json.rank || json.newPackageRank || json.monthlyPackageRank || json.packageRank || false
    if (!rank || rank == "NORMAL") return {rank: "NON", prefix: json.displayname}
    return { rank: replaceRank(rank), prefix: `[${replaceRank(rank)}] ${json.displayname}` }
  }

  getPlusColor(rank, plus) {
    if (plus == undefined || rank == 'PIG+++' || rank == "OWNER" || rank == "ADMIN" || rank == "GM" || rank == "YOUTUBE") {
      var rankColor = {
        'MVP': { mc: '§b', hex: '#55FFFF' },
        'MVP+': { mc: '§c', hex: '#FF5555' },
        'MVP++': { mc: '§c', hex: '#FFAA00' },
        'VIP+': { mc: '§a', hex: '#55FF55' },
        'VIP': { mc: '§a', hex: '#55FF55' },
        'YOUTUBE': { mc: '§c', mc2: '§f', hex: '#FF5555', hex2: '#F2F2F2'},
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

  getUHC(score) {
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

  getSpeedUHC(score) {
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

  getCaC(score) {
    let title = 'Gray'
    if (score >= 100000) title = 'Red';
    else if (score >= 50000) title = 'Dark Aqua';
    else if (score >= 20000) title = 'Gold';
    else if (score >= 5000) title = 'Yellow';
    else if (score >= 2500) title = 'White';

    return title
  }

  getBuildBattle(score) {
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
  // Arena Brawl
  getArena(setup) {
    if (!setup) return
    return setup
      .toLowerCase()
      .replace(/_/gi, " ")
      .replace("boulder toss", "Boulder Toss")
      .replace("shotgun", "Cookie Shotgun")
      .replace("falcon punch", "Falcon Punch")
      .replace("fireball", "Fireball")
      .replace("flame breath", "Flame Breath")
      .replace("freezing breath", "Freezing Breath")
      .replace("rocket pig", "Guided Pig 2000")
      .replace("lightning strike", "Lightning Strike")
      .replace("melon launcher", "Melon Launcher")
      .replace("pumpkin launcher", "Pumpkin Launcher")
      .replace("proximity mine", "Proximity Mine")
      .replace("rocket chicken", "Rocket Chicken")
      .replace("seismic wave", "Seismic Wave")
      .replace("snowball", "Snowball")
      .replace("flame sword", "Flame Sword")
      .replace("ancient breath", "Ancient Breath")

      .replace("barricade", "Barricade")
      .replace("charge", "Bull Charge")
      .replace("golemfall", "Golemfall")
      .replace("polymorph", "Petrify")
      .replace("shadow step", "Shadow Step")
      .replace("swap", "Swap")
      .replace("wall of vines", "Wall of Vines")
      .replace("magnetic impulse", "Magnetic Impulse")

      .replace("bone shield", "Bone Shield")
      .replace("cactus shield", "Cactus Shield")
      .replace("healing totem", "Healing Totem")
      .replace("holy water", "Holy Water")
      .replace("life leech", "Life Leech")
      .replace("star shield", "Star Shield")
      .replace("tree of life", "Tree of Life")
      .replace("spirit link", "Spirit Link")
      .replace("vampiric chain", "Vampiric Chain")
      .replace("time warp", "Time Warp")

      .replace("shield wall", "Shield Wall")
      .replace("arachnid", "Broodmother")
      .replace("doom shroom", "Doom Shroom")
      .replace("bersek", "Berserk")
      .replace("reflect damage", "Reflect Damage")

      .replace("damage", "Damage")
      .replace("energy", "Energy")
      .replace("speed", "Speed")
      .replace("tank", "Defence")
      .replace("slowing", "Slowing")
  }

  renameHypixelGames(game){
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
        .replace("tkr", "TKR")
        .replace("bw", "BedWars")
        .replace("sw", "SkyWars")
        .replace("ww", "Wool Wars")
        .replace("woolgame", "Wool Wars")
        .replace("wool_game", "Wool Wars")
        .replace("wool_games", "Wool Wars")

    }
  }

  // status
  getStatus(status) {
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

  getGamemode(mode) {
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

        .replaceAll(/_/g, " ")
  }

  getGameplayers(game) {
    if (!game) return
    return game.toLowerCase()
      .replace("_", "")

      .replace("megasw", "SKYWARS_MEGA")
      .replace("skywarsmega", "SKYWARS_MEGA")
      .replace("megaskywars", "SKYWARS_MEGA")
      .replace("swmega", "SKYWARS_MEGA")
      .replace("mega", "SKYWARS_MEGA")
      .replace("SKYWARS_MEGA", "skywars_mega")

      .replace("pb", "LEGACY_PAINTBALL")
      .replace("paintball", "LEGACY_PAINTBALL")
      .replace("LEGACY_PAINTBALL", "legacy_paintball")

      .replace("tkr", "LEGACY_TKR")
      .replace("turbokartracers", "LEGACY_TKR")
      .replace("LEGACY_TKR", "legacy_tkr")

      .replace("arena", "LEGACY_ARENA")
      .replace("ab", "LEGACY_ARENA")
      .replace("arenabrawl", "LEGACY_ARENA")
      .replace("brawl", "LEGACY_ARENA")
      .replace("LEGACY_ARENA", "legacy_arena")

      .replace("quake", "LEGACY_QUAKE")
      .replace("qc", "LEGACY_QUAKE")
      .replace("quakecraft", "LEGACY_QUAKE")
      .replace("LEGACY_QUAKE", "legacy_quake")

      .replace("thewalls", "LEGACY_WALLS")
      .replace("walls", "LEGACY_WALLS")
      .replace("LEGACY_WALLS", "legacy_walls")

      .replace("vz", "LEGACY_VAMPIREZ")
      .replace("vampirez", "LEGACY_VAMPIREZ")
      .replace("vampires", "LEGACY_VAMPIREZ")
      .replace("vampire", "LEGACY_VAMPIREZ")
      .replace("LEGACY_VAMPIREZ", "legacy_vampirez")

      .replace("ssh", "SUPERSMASH")
      .replace("supersmashheroes", "SUPERSMASH")
      .replace("SUPERSMASH", "supersmash")

      .replace("megawalls", "MW")
      .replace("MW", "mw")

      .replace("pixelparty", "PROTOTYPE_PIXELPARTY")
      .replace("pp", "PROTOTYPE_PIXELPARTY")
      .replace("PROTOTYPE_PIXELPARTY", "prototype_pixelparty")
  }

  /* ANTI DISCORD CHAT FORMATTING */
  dontFormat(text) {
    if (!text) return
    return text
      .replaceAll("*", "\\*")
      .replaceAll("_", "\\_")
      .replaceAll("~", "\\~")
      .replaceAll(">", "\\>")
      .replaceAll("`", "\\`")
      .replaceAll("|", "\\|")
  }

  chunk(size) {
    let result = [];
    while(this.length) {
      result.push(this.splice(0, size));
    }
    return result;
  }

  path(path, api) { 
    return path.split('/').filter(n => n).reduce((o, n, i) => {
      if (o[n] === undefined) return o
      return o[n]
    }, api)
  }
  
}

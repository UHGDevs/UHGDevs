const chalk = require('chalk')

global.path = process.mainModule.path
global.f = (number, max=2) => { return Number(number) ? Number(number).toLocaleString('en', {minimumFractionDigits: 0, maximumFractionDigits: max}) : number }
global.chunk = (arr, size) => {
  let result = [];
  while(arr.length) {
    result.push(arr.splice(0, size));
  }
  return result;
}

global.apiPath = (path, api) => {
  return path.split('/').filter(n => n).reduce((o, n, i) => {
    if (o[n] === undefined) return o
    return o[n]
  }, api)
}

global.ggl = (exp) => {
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

global.gl = (exp) => {
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

global.waitEvent = (item, event) => {
  return new Promise((resolve) => {
    const listener = (...a) => {
      item.removeEventListener(event, listener);
      resolve(a);
    }
    item.addEventListener(event, listener);
  })
}

global.letniCas = (date = new Date()) => {
    const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  
    return Math.max(january, july) !== date.getTimezoneOffset();
}

global.previousDay = (date = new Date()) => new Date(new Date(date.getTime()).setDate(date.getDate() - 1))

global.isInteraction = (i) => {
  if (i.id || i.customId) return true
  else return false
}

global.getId = (interaction, i) => {
  let splits = interaction?.customId?.split('_')
  if (splits.lenth < i) return undefined
  else return splits[i]
}

global.clear = (message) => message.replace(/✫|✪|⚝/g, '?').replace(/§|¡±/g, '�').replace(/�[0-9A-FK-OR]/gi, '')

if (!console.timer) console.timer = console.time

console.discord = (message, args = {}) => {
  console.log(chalk.bgMagenta.black(`[${getCurrentTime()}] Discord >`) + ' ' + chalk.magenta(message))

  let embed = { title: 'Discord', description: `**${message}**`, color: 2067276, footer: { text: args.startup ? 'settings display soon' : null } }
  if (global.config?.discord.log_channel === true) global.logging_channel?.send({ embeds: [embed] })

  return embed
}


console.minecraft = (message) => {
  return console.log(chalk.bgGreenBright.black(`[${getCurrentTime()}] Minecraft >`) + ' ' + chalk.greenBright(message))
}

console.warn = (message) => {
  return console.log(chalk.bgYellow.black(`[${getCurrentTime()}] Warning >`) + ' ' + chalk.yellow(message))
}


console.error = async (message, type = '') => {
  let windows = global.path.slice(0, 5).includes("\\")
  let reg = windows ? new RegExp (`${global.path.replaceAll('\\', '\\\\').replace('/', '\\\\')}.*:(\\d.):(\\d.)`) : new RegExp (`${global.path}.*:(\\d.):(\\d.)`)

  let path = windows ? 
      (String(message.stack).match(reg) ? String(message.stack).match(reg)[0].replace(global.path.replace('/', '\\'), ''):'unknown path') :
      (String(message.stack).match(reg) ? String(message.stack).match(reg)[0].replace(global.path, ''):'unknown path')

  let embed = { author: { name: String(message).trim() }, description: type || null, color: 15548997, footer: {text: path !== 'unknown path' ? path : null}}
  
  console.log(chalk.bgRedBright.black(`[${getCurrentTime()}] Error >`) + ' ' + chalk.redBright(message) + chalk.blueBright(`${path !== 'unknown path' ? ` at ${global.path + path}` : ''}`))
  if (global.config?.discord.log_channel === true) {
    await global.logging_channel?.send({
      embeds: [embed]
    })
  }

  return embed
} 


console.broadcast = (message, location) => {
  return console.log(chalk.inverse(`[${getCurrentTime()}] ${location} Broadcast >`) + ' ' + message)
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}
console.date = getCurrentTime

console.mongo = (message, options) => {
  console.log(chalk.bgBlue.black(`[${getCurrentTime()}] Mongo >`) + ' ' + chalk.blue(message))
  // if (global.config?.discord.log_channel === true) {
  //   global.logging_channel?.send({
  //     content: message
  //   })
  // }
}

console.time = (message, options) => {
  console.log(chalk.green.black(`[${getCurrentTime()}] TIME >`) + ' ' + chalk.greenBright(message))
  if (global.config?.discord.log_channel === true) {
    global.logging_channel?.send({
      content: message
    })
  }
}


module.exports = { getCurrentTime }



global.renameHypixelGames = (game) =>{
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
      .replace("pit", "The Pit")
      .replace("arcade", "Arcade Games")
      .replace("walls3", "Mega Walls")
      .replace("arena", "Arena Brawl")
      .replace("vampirez", "VampireZ")
      .replace("thewalls", "The Walls")
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

global.defaultConfig = () => {
  return {
    dev: true,
    discord: {
      prefix: '.',
      prefix_DEV: ',',
      enabled: true,
      bot_messages: false,
      log_channel: false,
      clientID: '892275591682883604',
      clientID_DEV: '892275591682883604',
      serverID: '758650512827613195',
      serverID_DEV: '758650512827613195',
      guildChatChannel: '957005113149521930',
      guildChatChannel_DEV: '957005113149521930',
      loggingChannel: '1017334503066320906'
    },
    minecraft: { enabled: 'test', prefix: '!' },
    time: {}
  }
}
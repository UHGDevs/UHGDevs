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
  if (global.config?.discord.log_channel === true) {
    global.logging_channel?.send({
      content: message
    })
  }
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
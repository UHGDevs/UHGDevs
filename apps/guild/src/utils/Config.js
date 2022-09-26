
const fs = require('fs');
const path = require('path');

class Config {
  constructor() {
    this.readConfig()
    this.initConfig()
  }
  initConfig() {
    fs.watchFile(path.resolve(__dirname, '../../config.json'), () => this.readConfig());
  }
  readConfig() {
    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../config.json'), 'utf8'))
    if (config.dev === true) {
      for (let key in config.discord) {
        if (String(key).endsWith('_DEV')) continue
        if (config.discord[key + '_DEV']) config.discord[key] = config.discord[key + '_DEV']
      }

      for (let key in config.time) {
        if (String(key).endsWith('_DEV')) continue
        if (config.discord[key + '_DEV']) config.discord[key] = config.discord[key + '_DEV']
      }
    }
    global.config = config
    this.config = config
  }

  async editConfig(cesty, value) {
    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../config.json'), 'utf8'))
    if (!Array.isArray(cesty)) cesty = [cesty]
    if (!Array.isArray(value)) value = [value]
    for (let o in cesty) {
      let p = config;
      let cesta = cesty[o].split('/').filter(n =>n)
      for (let i in cesta) {
        if (!p[cesta[i]] && i != cesta.length -1) p[cesta[i]] = {}
        i == cesta.length - 1 ? p[cesta[i]] = value[o] : p = p[cesta[i]]
      }
    }
    await fs.writeFile(path.resolve(__dirname, '../../config.json'), JSON.stringify(config, null, 4), 'utf8', data =>{})
  }

  handlePerms(perms, api) {
    if (!Array.isArray(perms) || !perms.length) return true
    let id = (api.user || api.author).id
    let allowed = perms?.find(n => n.type == 'USER' && id === n.id || n.type === 'ROLE' && n.guild && global.dc_client?.guilds?.cache.get(n.guild)?.members.cache.get(id)?._roles?.includes(n.id) || n.type === 'ROLE' && api.member?._roles.includes(n.id)) || false
    if (allowed) return true
    else return false
  }

  async stopBot(message = 'Discord BOT was stopped') {
    if (global.shuting === true) return

    await this.mongo.close()

    global.shuting = true

    if (global.config.discord.bot_messages === true) await global.guild_channel?.send({ embeds: [{ author: { name: `Discord BOT is now Offline` }, color: 15548997 }] })
  
    await console.error(message).catch(e => { console.warn(e); process.exit() })
    global.shuting = false
    process.exit()
  }

}
  
module.exports = Config
  
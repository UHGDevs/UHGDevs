
const path = require('node:path');
const fs = require('fs');

const uhgApi = require('../../api/src/index').Client;

const DiscordHandler = require('./discord/DiscordHandler');
const MinecraftHandler = require('./minecraft/MinecraftHandler');
const TimeHandler = require('./time/TimeHandler');
const Web = require('./web/Web');
const CommandsHandler = require('./commands/CommandsHandler');

class UHGDevs extends CommandsHandler {
  constructor() {
    super()
    this.filesCheck()
  }
  async appStart() {

      this.api = new uhgApi({ key: [process.env.api_key], db: process.env.db, antisniper: process.env.antisniper })
      this.discord = new DiscordHandler(this)
      this.time = new TimeHandler(this)
      this.web = new Web(this)
      this.minecraft = new MinecraftHandler(this)
  
      // this.discord.setBridge(this.minecraft)
      // this.minecraft.setBridge(this.discord)
      
  }

  async appConnect() {
    await this.createMongo()
    this.config.discord.enabled ? this.discord?.init() : null

    this.time?.init()
    this.minecraft?.createClient()
  }

  filesCheck() {
    let names = ['gexp', 'lb']
    let files = fs.readdirSync(path.join(__dirname, '../cache'))
    names.filter(n => !files.includes(n + '.json')).forEach(n => fs.writeFile(path.join(__dirname, '../cache/'+ n + '.json'), '{}', 'utf-8', data => {}))
  }
}

module.exports = new UHGDevs()
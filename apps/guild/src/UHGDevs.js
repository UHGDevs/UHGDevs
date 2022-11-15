
const uhgApi = require('../../api/src/index').Client;

const DiscordHandler = require('./discord/DiscordHandler');
//const MinecraftHandler = require('./minecraft/MinecraftHandler');
const TimeHandler = require('./time/TimeHandler');
const Mongo = require('./utils/Mongo');


class UHGDevs extends Mongo {
  constructor() {
    super()
  }
  async appStart() {

      this.api = new uhgApi({ key: [process.env.api_key, process.env.api_key_2], db: process.env.db, antisniper: process.env.antisniper })
      this.discord = new DiscordHandler(this)
      this.time = new TimeHandler(this)
      // this.minecraft = new MinecraftHandler(this)
  
      // this.discord.setBridge(this.minecraft)
      // this.minecraft.setBridge(this.discord)
      
  }

  async appConnect() {
    await this.createMongo()
    this.config.discord.enabled ? this.discord?.init() : null

    this.time?.init()
   // this.minecraft?.init()
  }
}

module.exports = new UHGDevs()
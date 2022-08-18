const { Collection } = require('discord.js');
const fs = require('fs');
const { MongoClient } = require("mongodb");
const { Client } = require('uhg-api')

const Functions = require('./functions.js')
class Login extends Functions {
  constructor(dc) {
    super()
    this.dc = {client: dc, commands: new Collection(), aliases: new Collection(), slash: new Collection(), cmd: new Collection(), loot: new Collection(), cache: {}}
    this.mc = {client: null, commands: new Collection(), aliases: new Collection(), send: [], ready: false}
    this.api = new Client({key: [process.env.api_key, process.env.api_key_2], db: process.env.db})
    this.test = {server:null}
    this.ignore = []
    this.data = {guild:[], verify:[], stats:[], uhg:[]}
    this.cache = {guildjoin: new Collection()}
    this.time = {events: new Collection(), ready:JSON.parse(fs.readFileSync('src/settings/config.json', 'utf8')).time}
    this.snipe = new Collection()
    this.info = {path: require.main.path + '/'}
    this.loot = {}
    this.ready = this.load()
  }
  async load() {
    delete this.ready
    this.reload(["settings", 'loot', 'aps'])
    require('../utils/embeds.js')(this)
    await Promise.all([this.createMongo()]);
    require("../utils/client.js")(this)
    require("../time/handler.js")(this)


    fs.watchFile('src/settings/config.json', (curr, prev) => this.reload(["settings"]));
    fs.watchFile('src/settings/values/lootBoxes.js', (curr, prev) => this.reload(["loot"]));

    setInterval(() => {
      this.reload(["mongo"])
    }, 120000);

    console.log("Guild bot je připraven!".bold.brightGreen)

    if (this.mc.client) require("../minecraft/handler.js") (this)
    this.emit("ready")
  }

  async createMongo() {
    const mongo = new MongoClient(process.env.db);
    await mongo.connect()
    await require("../utils/mongodb").setup(mongo)
    this.mongo = {client: mongo, run: require("../utils/mongodb")}
    await this.reload(["mongo"])
  }

  async reload(reload=[]) {
    if (reload.includes("settings") || !reload.length) {
      let oldtime;
      if (this.settings) oldtime = this.settings.time
      this.settings = JSON.parse(fs.readFileSync('src/settings/config.json', 'utf8'));
      if (oldtime) {
        try {
          Object.keys(this.settings.time).forEach(key => {
            if (!oldtime[key]==this.settings.time[key]) {
              if (this.settings.time[key] === true) {this.time.events.get(key).start.start(); this.time.ready[key] = true; return;}
              else this.time.events.get(key).start.stop();
            }
          });
        } catch (e) {console.log("Time event neni pripraven!"); console.log(e)}
      }
    }

    if (reload.includes("aps") || !reload.length) {
      this.aps = JSON.parse(fs.readFileSync('src/settings/values/achievements.json', 'utf8'));
    }

    if (reload.includes("guild") || reload.includes("mongo") || !reload.length) {
      if (!this.data.guild) this.data.guild = []
      guild(this)
      async function guild(uhg) {
        let guild = await uhg.mongo.run.get("stats", "guild")
        uhg.data.guild = guild
        uhg.members = []
        uhg.data.guild[0].members.forEach(member =>{ uhg.members.push(member.name) })
      }
    }

    if (reload.includes("verify") || reload.includes("mongo") || !reload.length) {
      if (!this.data.verify) this.data.verify = []
      let ver = await this.mongo.run.get("general", "verify")
      this.data.verify = ver
    }

    if (reload.includes("stats") || reload.includes("mongo")  || !reload.length) {
      if (!this.data.stats) this.data.stats = []
      stats(this)
      async function stats(uhg) {
        let stat = await uhg.mongo.run.get("stats", "stats")
        uhg.data.stats = stat
      }
    }

    if (reload.includes("uhg") || reload.includes("mongo") || !reload.length ) {
      if (!this.data.uhg) this.data.uhg = []
      let uh = await this.mongo.run.get("general", "uhg")
      this.data.uhg = uh
    }

    if (reload.includes("loot") || !reload.length ) {
      let req = Object.keys(require.cache).filter(n => n == require.main.path+'/settings/values/lootBoxes.js')
      if (req.length) delete require.cache[req[0]];
      let lootData = require('../settings/values/lootBoxes')
      this.loot.data = lootData 
    }
  }

  restartbot() {
    if (this.mc.client) this.mc.client.end()
    require("../utils/client")(this)
    require("../minecraft/handler.js")(this)
    return "Bot byl úspěšně restartován"
  }

  dcsend(message, where='bot') {
    if (typeof message !== 'string' || !message.length) return false
    let channel;
    if (Number(where)) channel = this.dc.client.channels.cache.get(where)
    else channel = this.dc.cache.channels.get(where)
    if (!channel) return false
    channel.send(message)
    return true
  }
}


module.exports = Login

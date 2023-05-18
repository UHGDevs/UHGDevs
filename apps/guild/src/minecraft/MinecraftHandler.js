const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const minecraft = require('minecraft-protocol');
const squid = require('flying-squid');

class Minecraft {
    constructor(uhg) {
        this.uhg = uhg

        this.send = []
        this.ready = false
    }


    restartbot(bot = "uhg") {


        if (this['c_'+bot.toLowerCase()]) {
          this['c_'+bot.toLowerCase()].end()
          this['c_'+bot.toLowerCase()].removeAllListeners()
          delete this['c_'+bot.toLowerCase()]
        }
        this.createClient(bot.toLowerCase())
    }

    msaCode(data) {
        const msg = `Nové přihlášení:\nLink: ${data.verification_uri}\nKód: \`${data.user_code}\``
        let channel = dc_client.channels.cache.get('875503798733385779')
        channel?.send({ content: msg }).then(n => { setTimeout(() => n.delete(), data.expires_in * 100) }).catch()
    }

    createClient(bot = 'all') {
      if (config.minecraft.find(n => n.enabled === "test") && !this.server) this.server = squid.createMCServer({ port: 25565, 'max-players': 10, 'online-mode': false, gameMode: 1, difficulty: 1, plugins: {}, 'view-distance': 2, version: '1.16.1', })

      let ucty = config.minecraft.find(n => n.id == bot) ? config.minecraft.filter(n => n.id == bot).length : config.minecraft

      for (let nastaveni of ucty) {
        let id = nastaveni.id
        if (nastaveni.enabled === "true") this["c_" + id] = minecraft.createClient({ host: "mc.hypixel.net", username: process.env.email, password: process.env.password, auth: 'microsoft', onMsaCode: this.msaCode, profilesFolder: path.join(__dirname, './data') })
        else if (nastaveni.enabled === "test")  this["c_" + id] = minecraft.createClient({ host: "localhost", port: 25565, username: `${id}_bot`, version: "1.16.1" })
        else this["c_" + id] = null

        if (this["c_" + id] && !this["c_" + id].botId) this["c_" + id].botId = id

        this["c_" + id]?.setMaxListeners(Infinity)

        if (!this["interval_"+id]) {
          let classa = this
          this["interval_"+id] = setInterval(() => {
            if (!classa['send_'+id]) classa['send_'+id] = [] 
            if (!classa['send_'+id].length || !classa['send_ready_'+id]) return
            classa.classa['send_ready_'+id] = false
            //require("./send").write(uhg, uhg.mc.send[0])
            console.log(classa['send_ready_'+id][0])
            classa['send_ready_'+id].shift()
          }, 700);

          // clearInterval(interval)

          if (this['c_'+id]) this.events(this['c_'+id])

          
        }
      }
    }

    events(client) {
      client.on("chat", this.message.bind(null, client));
      client.on("error", error => {
        console.log("CHYBA V botovi:\n".bgRed + String(error.stack).bgRed)
        this.restartbot(client.botId)
      })
      client.on("kick_disconnect", packet => { global.logging_channel?.send({ content: JSON.parse(packet.reason).extra[0].text}); this.restartbot(client.botId) })
    
    }

    async message (client, packet) {
      let botUsername = client.username

      const pmsg = {}
      let message = JSON.parse(packet.message);
      if (message.extra) {
        let msgs = []
        for (let i=0; i<message.extra.length;i++) msgs.push(message.extra[i].text)
    
        pmsg.extra = clear(msgs.join("")) || null
        pmsg.non = msgs.join("") || null
      } else pmsg.extra = null
    
      if (message.text && pmsg.extra) pmsg.msg = clear(message.text) + pmsg.extra
      else pmsg.msg = pmsg.extra|| clear(message.text)||null
      if (!pmsg.msg) return { msg: false }
      if (pmsg.msg.startsWith("-")) pmsg.msg = pmsg.msg.replace(/-/g, "").trim()
      pmsg.msg = pmsg.msg.replace(/\s+/g, ' ').trim()
    
      console.log(pmsg.msg)
      // Add to message buffer (like 20 messages? idk)

      //["Guild", ">", "jmenonnona:", "zprava"]
      let content = pmsg.msg.split(" ")
    
      let again = true;
      let again1 = true
      for (let a=0; a<7; a++) {
        if (!Array.isArray(content)) break
        else if (!content.length) content = pmsg.msg
        else if (content[0] == botUsername) content.shift()
        else if (content[0].match(/To|From/) && a==0) {pmsg.channel = content[0]; content.shift()}
        else if (content[0].match(/To|From|Party|Guild|Officer/) && content[1] && content[1].startsWith(">") && content[2] && !content[2].startsWith("[") && !content[2].endsWith("]") && again1 == true) {
          //if the guild member is non
          if (content.length > 1) content.splice(0, 0, content.splice(2, 1)[0]);
          pmsg.username = content[0].replace(":", "")
          content.shift()
          again1 = false;
        }
        else if (content[0].match(/To|From|Party|Guild|Officer/) && content[1] && content[1].startsWith(">") && again == true) { pmsg.channel=content[0]
          content.shift()}
        else if (content[0].startsWith(">")) content.shift()
        else if (a<4 && content[0].startsWith("[") && content[0].endsWith("]")) {
          pmsg.rank = content[0]
          content.shift()
          pmsg.username = content[0].replace(":", "")
          again = false
        }
        else if (content[0].startsWith("[") && content[0].endsWith(":")) {
          content.shift()
        }
        else if (content[0] == "Name:" && content[1] == "UltimateHypixelGuild") {
          content[0].replace(":", "")
          content.shift()
        }
        else if (a < 7 && content[0].endsWith(pmsg.username + ":") || a < 7 && content.length > 1 && content[1].startsWith("[") && content[1].endsWith("]:")) { /*username = content[0].replace(":", "")*/
        content.shift()}
        else if (a < 3 && (content[1]=="joined"||content[1]=="joined."||content[1]=="left."||pmsg.msg.includes("was kicked from the guild by") || pmsg.msg.includes("has requested to join the Guild!"))) { pmsg.username = content[0]
        content.shift()}
        else {
          content = content.join(" ")
          break
          }
      }
      pmsg.content = content
    
      if (typeof pmsg.content != 'string') console.log("\n\n\nSTRING\n\n\n")
      if (typeof pmsg.content != 'string') pmsg.content = pmsg.content.join(" ")
      if (pmsg.msg.startsWith("You have joined ")&&(pmsg.msg.endsWith(`'s party!`)||pmsg.msg.endsWith(`s' party!`))) {
        let t = pmsg.msg.replace("You have joined ", "").split(" ")
        pmsg.event = "pjoin"
        if (t[0].includes("[")) {
          pmsg.rank = t[0]
          pmsg.username = t[1].replace("'s", "")
        } else pmsg.username = t[0].replace("'s", "")
      } else if (pmsg.msg.startsWith("---") && pmsg.msg.includes("has invited you to join their party!")) {
        let t = pmsg.msg.replace(/-/g, "").substring(1).slpit(" ")
        pmsg.event = "pinvite"
        if (t[0].includes("[")) {
          pmsg.rank = t[0]
          pmsg.username = t[1]
        } else pmsg.username = t[0]
      } else if (pmsg.msg.includes(" has requested to join the Guild!")) {
        t = pmsg.msg.split(" has requested to join the Guild!")[0].split(" ")
        pmsg.channel = "Officer"
        pmsg.event = "grequest"
        if (t[0].includes("[")) {
          pmsg.rank = t[0]
          pmsg.username = t[1]
        } else pmsg.username = t[0]
      } else if (pmsg.msg.startsWith('The guild has completed Tier')) {
        pmsg.channel = "Guild"
        pmsg.event = "gtier"
      } else if (pmsg.msg.endsWith(" joined the guild!")) {
        pmsg.channel = "Guild"
        pmsg.event = "gjoin"
      } else if (pmsg.msg.endsWith(" left the guild!")||pmsg.msg.includes("was kicked from the guild by")) {
        pmsg.channel = "Guild"
        pmsg.event = "gleave"
      } else if (pmsg.msg.startsWith("The Guild has reached Level ")) {
        pmsg.channel = "Guild"
        pmsg.event = "glevel"
      } else if (pmsg.msg.includes("was demoted")) {
        pmsg.channel = "Guild"
        pmsg.event = "gdemote"
      } else if (pmsg.msg.includes("was promoted")) {
        pmsg.channel = "Guild"
        pmsg.event = "gpromote"
      } else if (pmsg.msg.endsWith("to your guild. They have 5 minutes to accept.")) {
        pmsg.channel = "Officer"
        pmsg.event = "ginvite"
      }
      if (!pmsg.channel || pmsg.username==uhg.mc.client.username) return pmsg
      //console.log(pmsg)
    
      /*
      let verify = uhg.data.verify ? uhg.data.verify.filter(n => n.nickname == pmsg.username) : await uhg.mongo.run.get("general", "verify", { nickname: pmsg.username })
      if (verify.length) {
        verify = verify[0]
        pmsg.uuid = verify.uuid
        let uhgDb = uhg.data.uhg ? uhg.data.uhg.filter(n => n.username == pmsg.username) : await uhg.mongo.run.get("general", "uhg", { username: pmsg.username })
        if (uhgDb.length) {
          pmsg.grank = uhgDb[0].guildrank
          pmsg.verify = true
          pmsg.verify_data = uhgDb[0]
        }
          pmsg.id = verify._id
      }
      */
    
      if (pmsg.rank && pmsg.rank == "[MVP++]") pmsg.pluscolor = pmsg.non.split("++")[0].slice(-2)
      if (pmsg.rank && pmsg.rank == "[MVP+]") pmsg.pluscolor = pmsg.non.split("+")[0].slice(-2)
    
      if (pmsg.channel == "Guild" && pmsg.content.startsWith("!") || pmsg.channel=="Officer" && pmsg.content.startsWith("!")) {
        pmsg.command = pmsg.content.substring(1).split(" ")[0]
        pmsg.nickname = pmsg.content.split(" ")[1] || pmsg.username || null
        pmsg.args = pmsg.content.split(pmsg.command)
        pmsg.args.shift()
        pmsg.args = pmsg.args.filter(n=>!n.startsWith("["))
        pmsg.args = pmsg.args.join(pmsg.command).trim()
      }
    
      if (pmsg.channel == "From" && pmsg.verify) {
        if (pmsg.content.startsWith("!")) pmsg.command = pmsg.content.substring(1).split(" ")[0]
        else pmsg.command = pmsg.content.split(" ")[0]
        pmsg.nickname = pmsg.content.split(" ")[1] || pmsg.username || null
        pmsg.args = content.split(pmsg.command)
        pmsg.args.shift()
        pmsg.args = pmsg.args.join(pmsg.command).trim()
      }
    
      if (pmsg.channel == "To") return

      this.chat(client, pmsg)
    
    }

    async chat(client, pmsg) {

    }
}

module.exports = Minecraft
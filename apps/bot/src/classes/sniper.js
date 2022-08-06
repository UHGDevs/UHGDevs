const { Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');

class Sniper {
  constructor(uhg, api, notify) {
    this.uhg = uhg
    this.getApi = uhg.getApi
    this.username = api.username
    this.uuid = api.uuid
    this.notify = notify
    this.setup = this.setup()
    this.totalchecks = 0
    this.checks = 0
    this.sniped = false
    this.newueue = 0
  }

  setup() {
    delete this.setup
    if (this.notify === false) delete this.notify
    this.time = Number(new Date())
    return "for UHG Snipers"
  }

  async run() {
    let time = this.uhg.toTime(Number(new Date()) - this.time, true)
    let ttime = `${Math.floor(time.m)}min ${Math.floor(time.s-Math.floor(time.m)*60)}s`
    this.totalchecks += 1
    let api = await this.getApi(this.uuid, ["online", "recent"])
    if (api instanceof Object == false) return this.echo(api, false, new MessageEmbed().setColor('RED').setTitle('ERROR V API').setDescription(api).setFooter({ text: 'By DavidCzPdy' }))

    if (!api.online.online) {
      this.uhg.snipe.delete(this.username)
      return this.echo("Hráč není online, vypnuto", null, new MessageEmbed().setColor('RED').setTitle(`${this.username} Není online`).setDescription(`Čas sledování: ${ttime}`).setFooter({ text: 'By DavidCzPdy' }))
    }


    let review = `Game: ${api.online.game} Mode: ${api.online.mode} Map: ${api.online.map}`

    let embed = new MessageEmbed().setFooter({ text: 'By DavidCzPdy' })

    if (api.online.game == "SkyBlock") {
      return this.echo(`${this.username} hraje SkyBlock (${api.online.mode})`, null, embed.setColor('GREY').setTitle(`${this.username} hraje Skyblock (${api.online.mode})`).setDescription(`**Celkový čas pozorování:** ${ttime}`))
    }

    if (api.online.mode == "lobby") {
      let men;
      if (api.online.mode != this.mode || api.online.game != this.game) men = `<@${this.author}>`
      this.echo(`${this.username} je v ${api.online.game} Lobby!`, men, embed.setColor('DARK_PURPLE').setTitle(`${this.username} je v ${api.online.game} Lobby!`).setDescription(`**Celkový čas pozorování:** ${ttime}`))
      this.mode = api.online.mode
      this.game = api.online.game
      this.map = null
      return
    }

    let lastgame = api.recent.games[0]

    let status;
    let lgtime = this.uhg.toTime(Number(new Date())-lastgame.date, true)
    if (!lastgame.ended) status = `In game - ${Math.floor(lgtime.m)}m ${Math.floor(lgtime.s-Math.floor(lgtime.m)*60)}s`
    else status = "In Queue!"
    if (lastgame.map != api.online.map) status = "In Queue! (dev - v2)"

    if (this.checks === 0) {
      this.game = api.online.game
      this.map = api.online.map
      this.mode = api.online.mode
    }

    if (this.game != api.online.game || this.map != api.online.map || this.mode != api.online.mode) {
      this.sniped = false
      let zmena = [`**Status: ${status}**`]

      if (this.game != api.online.game) zmena.push(`**Game:** ${this.game || "First time"} → **${api.online.game}**`)
      else zmena.push(`**Game:** **${api.online.game}**`)

      if (this.mode != api.online.mode) zmena.push(`**Mode:** ${this.mode || "First time"} → **${api.online.mode}**`)
      else zmena.push(`**Mode:** **${api.online.mode}**`)

      if (this.map != api.online.map) zmena.push(`**Mapa:** ${this.map || "First time"} → **${api.online.map}**`)
      else zmena.push(`**Mapa:** **${api.online.map}**`)

      if (status.startsWith("In Queue")) embed.setColor("DARK_PURPLE")
      else embed.setColor("GREEN")


      this.echo(`${this.username} změnil svojí polohu! Status: ${status} Kde: ${review}`, `<@${this.author}>`, embed.setTitle(`**${this.username}** změnil svojí polohu!`).setDescription(zmena.join("\n")))
      this.checks += 1
      this.game = api.online.game
      this.map = api.online.map
      this.mode = api.online.mode
      return
    }

    if (status.startsWith("In Queue")) {
      let desc = []
      desc.push(`**Game:** **${api.online.game}**`)
      desc.push(`**Mode:** **${api.online.mode}**`)
      desc.push(`**Mapa:** **${api.online.map}**`)


      this.echo(`${this.username} je v queue! ${review}`, null, embed.setColor('DARK_PURPLE').setTitle(`${this.username} je v QUEUE!`).setDescription(desc.join("\n")))
      this.checks += 1
      return
    }


    this.checks += 1

    if (this.checks%3==0) {
      let desc = []
      desc.push(`**Game Time:** \`${Math.floor(lgtime.m)}m ${Math.floor(lgtime.s-Math.floor(lgtime.m)*60)}s\``)
      desc.push(`**Game:** **${api.online.game}**`)
      desc.push(`**Mode:** **${api.online.mode.replace(api.online.game)}**`)
      desc.push(`**Mapa:** **${api.online.map}**`)
      desc.push(``)
      desc.push(`**Track Time:** \`${ttime}\``)
      desc.push(`**Total Checks:** \`${this.checks}\``)

      embed.setDescription(desc.join("\n")).setColor('GREY').setTitle(`${this.username} je ve hře!`)
      return this.echo(`${this.username} - Status: ${status} ${review}`, null, embed)
    }

    //console.log(api)
    //this.echo(api.online.footer)
    return
  }

  async echo(message, mention="", embed=null) {
    if (embed) this.msg.edit({ embeds: [embed] })
    else this.message.channel.send(message + " " + mention)
    if (embed && mention) {
      let temp = await this.message.channel.send(mention)
      await temp.delete()
    }
    if (this.notify && (mention || !this.sniped)) this.uhg.mc.send.push({send: `/msg ${this.notify} ` + message})
  }
}


module.exports = Sniper

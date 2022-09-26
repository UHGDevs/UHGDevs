
const Filter = require('bad-words')
const filter = new Filter()

class MessageHandler {
  constructor(discord) {
    this.uhg = discord.uhg
    this.discord = discord
    this.config = this.uhg.config.discord
  }

  async onMessage(message) {
    if (message.author.id == global.config.discord.clientID) return
    if (!message.author.bot && (message.channel.id == global.config.discord.officerChannel || message.channel.id == global.config.discord.guildChatChannel) && message.content && message.content.length > 0) this.bridge(message);

    let reply;

    if (message.content.startsWith(this.config.prefix)) {
      let commands = this.uhg.commands.filter(n => n.type?.includes('message'))

      let args = message.content.replace(this.config.prefix, '').split(' ').map(n => n.trim())
      let cmd = commands.get(args[0].toLowerCase()) || commands.get(this.uhg.aliases.get(args[0].toLowerCase()))
      if (cmd) {
        let perms = this.uhg.handlePerms(cmd.permissions, message)
        if (perms) reply = await cmd?.run(this.uhg, message, message.content.replace(this.config.prefix, '').replace(args[0], '').trim()).catch(async (e) => message.reply({ embeds: [await console.error(e)], failIfNotExists: false }))
        else reply = `${message.member.nickname || message.author.username} nemá oprávnění na \`${cmd.name}\` příkaz!`
      }
    }

    if (reply && typeof reply === 'string') {
      console.discord(reply)
      message.reply({ content: reply, failIfNotExists: false })
    }
  }

  async bridge(message) {
    const banned = ["vape", "liquidbounce", "wurst", "sigma", "huzuni", "kys", " ip ", "fuck", "fag", "fa g", "f ag", "fu ck", "f uck", "fuc k", "fack", "shit", "0.0.0.0", "255.255.255.255", "i-p", "i.p", "retard", "retarded", "penis", "dick", "porn", "gay", "gej", "lgbt", "die", "kill yourself", "kill urself", "nigga", "nigger", "niger", "niga", "negr"];

    let chat = message.channel.id == global.config.discord.officerChannel ? '/go' : '/gc'


    // if (uhg.mc.client?.socket?._host !== 'mc.hypixel.net') return uhg.settings.offline ? message.reply({ content: "Bot není na hypixelu.", failIfNotExists: false }) : false

    let user = this.uhg.data?.verify?.length ? this.uhg.data.verify.find(n=>n._id==message.author.id) : {nickname: message.guild.members.cache.get(message.author.id).nickname || message.author.username}
    if (!user) return message.reply({ content: `Nejsi verifikovaný, zpráva nebyla odeslána.\nVerifikuj se pomocí /verify`, failIfNotExists: false })
    if (message.content == "") return message.reply({ content: "Zpráva nelze odeslat", failIfNotExists: false}) // better handlering here
    if (message.content.length > 245) message.reply({ content: "Zpráva byla useknuta", failIfNotExists: false })

    if (banned.some(n => message.content.toLowerCase().includes(n.toLowerCase())) || message.content.toLowerCase().endsWith(' ip')) return message.reply({ content: "Zpráva obsahuje nepovolené slovo", failIfNotExists: false })

    let username = user.nickname
    if (message.reference) {
      let msg = await global.dc_client.channels.cache.get(message.reference.channelId).messages.fetch(message.reference.messageId)
      let replied = {};
      if (msg.author.id == '950076450478899270' || msg.author.id == '892275591682883604') {
        if (msg.embeds?.length) replied.nickname = `${msg.embeds[0]?.title || ''} command`.trim()
        else if (msg.content && msg.content.match(/.*(<:server1:914915236035825694><:server2:914915235956138014><:server3:914915235507339295><:server4:914916963304742982><:server5:914916963388649492> `).*(left.)/)) replied.nickname = 'left message'
        else if (msg.content && msg.content.match(/.*(<:server1:914915236035825694><:server2:914915235956138014><:server3:914915235507339295><:server4:914916963304742982><:server5:914916963388649492> `).*(joined.)/)) replied.nickname = 'joined message'
        else if (msg.content && msg.content.match(/\_.*\*\*(.*:)?\*\*/gi)) replied.nickname = msg.content.match(/\_.*\*\*(.*:)?\*\*/gi)[0].split('**').filter(n=>!n.includes(' '))[0]?.replace(':', '')
        else replied.nickname = 'bot'
      } else replied = (this.uhg?.data?.verify?.length ? this.uhg?.data.verify.find(n=>n._id==msg.author.id) : null) ||  {nickname: msg.guild.members.cache.get(msg.author.id).nickname || msg.author.username}
      username = `${username} replied to ${replied.nickname}`
    }

    let send = `${chat} ${username}: ${message.content}`
    console.discord(send)
  }
}

module.exports = MessageHandler

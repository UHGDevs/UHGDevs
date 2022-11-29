
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
    if (!message.author.bot && (message.channel.id == global.config.discord.officerChannel || message.channel.id == global.config.discord.guildChatChannel) && message.content && message.content.length > 0) this.bridge(message); // add function for this (also with tkjk)
    if (message.channel.type === 1) dc_client.channels.cache.get('1027491511857840168')?.send({ embeds: [{ title: `${message.author.username}'s dm` , description: message.content}]})


    if (message.content.startsWith(this.config.prefix)) this.runCommand(message) // pridat mc channels with mc prefix
  }

  async runCommand(message) {
    let commands = this.uhg.commands.filter(n => n.type?.includes('message'))

    let args = message.content.replace(this.config.prefix, '').split(' ').filter(n => n).map(n => n.trim())
    let cmd = commands.get(args[0].toLowerCase()) || commands.get(this.uhg.aliases.get(args[0].toLowerCase()))
    if (!cmd) return

    let data = {} // verify & premium data
    let reply;

    let perms = this.uhg.handlePerms(cmd.permissions, message) // ADD user stats (for premium), maybe add reason? (who has access)

    if (!perms) reply = `${message.member.nickname || message.author.username} nemá oprávnění na \`${cmd.name}\` příkaz!`
    else if (cmd.platform === 'dc') reply = await cmd?.run(this.uhg, message, message.content.replace(this.config.prefix, '').replace(args[0], '').trim()).catch(async (e) => message.reply({ embeds: [await console.error(e)], failIfNotExists: false }));
    else if (cmd.platform === 'mc') reply = await cmd?.run(this.uhg, {username: args[0], nickname: args[0], msg: message.content.replace(this.config.prefix, '').replace(args[0], '').trim(), user: data}).catch(async (e) => message.reply({ embeds: [await console.error(e)], failIfNotExists: false }));

    if (!reply) return


    console.discord(typeof reply === 'string' ? reply : reply.msg)
    let dcreply = { failIfNotExists: false }
    if (typeof reply === 'string') dcreply.content = reply
    else if (reply.embed) dcreply.embeds = [reply.embed]
    else if (reply.msg) dcreply.content = reply.msg

    message.reply(dcreply)
    

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

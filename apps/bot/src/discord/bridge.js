const banned = ["vape", "liquidbounce", "wurst", "sigma", "huzuni", "kys", " ip ", "fuck", "fag", "fa g", "f ag", "fu ck", "f uck", "fuc k", "fack", "shit", "0.0.0.0", "255.255.255.255", "i-p", "i.p", "retard", "retarded", "penis", "dick", "porn", "gay", "gej", "lgbt", "die", "kill yourself", "kill urself", "nigga", "nigger", "niger", "niga", "negr"];
module.exports = async (uhg, message) => {

  let chat;
  if (message.channel.id==uhg.getDiscordIds().channels.officer) chat = "/go"
  if (message.channel.id==uhg.getDiscordIds().channels.guild) chat = "/gc"
  if (!chat) return;

  let user = uhg.data.verify?.length ? uhg.data.verify.find(n=>n._id==message.author.id) : {nickname: message.guild.members.cache.get(message.author.id).nickname || message.author.username}
  if (!user) return message.reply({ content: `Nejsi verifikovaný, zpráva nebyla odeslána.\nVerifikuj se pomocí ${uhg.settings.prefix}verify *\`nick\`*`, failIfNotExists: false })
  if (message.content == "") return message.reply({ content: "Zpráva nelze odeslat", failIfNotExists: false})
  if (message.content.length>245) message.reply({ content: "Zpráva byla useknuta", failIfNotExists: false })

  if (uhg.includesWithArray(message.content.toLowerCase(), banned) || message.content.toLowerCase().endsWith(' ip')) try {return message.reply({ content: "Zpráva obsahuje nepovolené slovo", failIfNotExists: false })} catch (e) {console.log(e)}

  let username = user.nickname
  if (message.reference) {
    let msg = await uhg.dc.client.channels.cache.get(message.reference.channelId).messages.fetch(message.reference.messageId)
    let replied = (uhg.data.verify?.length ? uhg.data.verify.find(n=>n._id==msg.author.id) : null) ||  {nickname: msg.guild.members.cache.get(msg.author.id).nickname || msg.author.username}
    
    username = `${username} replied to ${replied.nickname}`
  }

  require("../minecraft/send.js").send(uhg, {send: `${chat} ${username}: ${message.content}`})

}

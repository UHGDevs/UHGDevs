const banned = ["vape", "liquidbounce", "wurst", "sigma", "huzuni", ".org", ".net", ".com", ".gg", "https://", "http://", "kys", ".xxx", " ip", "fuck", "fag", "fa g", "f ag", "fu ck", "f uck", "fuc k", "fack", "shit", "0.0.0.0", "255.255.255.255", "i-p", "i.p", "retard", "retarded", "penis", "dick", "porn"];
module.exports = async (uhg, message) => {
  let user = uhg.data.verify.filter(n=>n._id==message.author.id)[0]
  if (!user) return message.reply(`Nejsi verifikovaný, zpráva nebyla odeslána.\nVerifikuj se pomocí ${uhg.settings.prefix}verify *\`nick\`*`)
  if ((message.channel.id==uhg.getDiscordIds().channels.officer || message.channel.id==uhg.getDiscordIds().channels.guild) && message.content == "") return message.reply("Zpráva nelze odeslat")
  if ((message.channel.id==uhg.getDiscordIds().channels.officer || message.channel.id==uhg.getDiscordIds().channels.guild) && message.content.length>245) message.reply({ content: "Zpráva byla useknuta" })

  for (let i = 0; i < banned.length; i++) {
    if ((message.channel.id==uhg.getDiscordIds().channels.officer || message.channel.id==uhg.getDiscordIds().channels.guild) && message.content.toLowerCase().includes(banned[i])) return message.reply({ content: "Zpráva obsahuje nepovolené slovo" })
  }

  let chat;
  if (message.channel.id==uhg.getDiscordIds().channels.officer) chat = "/go"
  if (message.channel.id==uhg.getDiscordIds().channels.guild) chat = "/gc"
  if (!chat) return;

  require("../minecraft/send.js").send(uhg, {send: `${chat} ${user.nickname}: ${message.content}`})

}

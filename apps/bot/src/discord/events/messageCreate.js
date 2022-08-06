const { MessageEmbed } = require('discord.js');
module.exports = async (uhg, message) => {
  if (message.channel.id == "928007600115703808") {
      if (uhg.settings.deleteverify) setTimeout(() => message.delete().catch((error) => {}), 30000)
      message.guild.channels.cache.get("548772550386253824").send({content: `Autor: ${message.author} Zpráva: ${message.content}`, allowedMentions: {parse: []} })
  } else if (message.channel.id == "877257855084924949") {
    if (uhg.settings.deleteverify)setTimeout(() => message.delete().catch((error) => {}), 30000)
    message.guild.channels.cache.get("877432655954706473").send({content: `Autor: ${message.author} Zpráva: ${message.content}`, allowedMentions: { parse: [] }})
}
  if (!message.guild || !message.channel || message.author.bot) return;
  if (message.channel.partial) await message.channel.fetch();
  if (message.partial) await message.fetch();

  let prefix = uhg.settings.prefix || "."
  let mcchat = Object.values(uhg.getDiscordIds().channels).includes(message.channel.id)

  if (message.content.toLowerCase().startsWith("u!verify ")) message.content = message.content.replace("u!verify ", ".verify ")
  if (!message.content.startsWith(prefix) && !mcchat) return
  if (mcchat) require("../bridge.js")(uhg, message);

  let content;
  if (message.content.trim().startsWith(prefix)) content = message.content.trim().replace(prefix, "").trim()
  else if (message.content.trim().startsWith("!") && mcchat) content = message.content.trim().replace("!", "").trim()
  if (!content) return

  let command = uhg.dc.commands.get(content.split(" ")[0]);
  if (!command) command = uhg.dc.commands.get(content.split(" ")[0].toLowerCase());
  if (!command) command = uhg.dc.commands.get(uhg.dc.aliases.get(content.split(" ")[0].toLowerCase()));
  if (command) {
    if (command.allowedids.length && !command.allowedids.includes(message.author.id) && message.author.id !== "378928808989949964") return await message.channel.send("Nemáš na to oprávnění!")
    let msg = await command.run(uhg, message, content.replace(content.split(" ")[0], "").trim())
    if (msg) await message.channel.send(msg)
    return
  }

  if (!command) command = uhg.mc.commands.get(uhg.mc.aliases.get(content.split(" ")[0].toLowerCase()));
  if (command) {
    let msg = await command.run(uhg, {username: uhg.data.verify.filter(n=>n._id==message.author.id)[0].nickname||content.split(" ")[0], args:content.toLowerCase().replace(content.split(" ")[0].toLowerCase(), "").trim()||"", nickname:content.split(" ")[1]||uhg.data.verify.filter(n=>n._id==message.author.id)[0].nickname||"KOkasfneplatne"}) || "error v posilani mc commandu z discordu"
    if (mcchat) {
      let mcchannel = "/go "
      if (message.channel.id == uhg.getDiscordIds().channels.guild) mcchannel = "/gc "
      require("../../minecraft/send").send(uhg, {send: mcchannel + (typeof msg == 'object' ? msg.mc:msg) })
    }

    if (typeof msg == 'object') message.reply({ embeds: [msg.dc] })
    else message.reply({ content: msg })
    return
  }



  if (uhg.test.server){
    if (content == "gfind") await uhg.test.server.broadcast(`§2Guild > §b[MVP§8+§b] Honzu §e[Gnrl]§f: někdo bedwars? je to nejlepší hra`)
    if (content == "gcmd") await uhg.test.server.broadcast(`§2Guild > §b[MVP§8+§b] Farmans §e[Gnrl]§f: !level Honzu`)
    if (content == "gchat") await uhg.test.server.broadcast(`§2Guild > §a[VIP§6+§a] The_AntiFrost_SK§f [Elite]: necham drakov`);
    if (content == "mvp") await uhg.test.server.broadcast(`§2Guild > §b[MVP] Zayoo§f: necham drakov`)
    if (content == "pchat") await uhg.test.server.broadcast(`§2Party > §a[VIP§6+§a] AntreX95§f: necham drakov`);
    if (content == "non") await uhg.test.server.broadcast(`§2Guild > §7Drunter6§f [Elite]: necham drakov`)
    if (content == "msg") await uhg.test.server.broadcast(`From §6[MVP§9+§6] Farmans: !online Honzu`)
    if (content == "join") await uhg.test.server.broadcast(`§2Guild >  Farmans joined.`)
    if (content == "gjoin") await uhg.test.server.broadcast(`§b[MVP§8+§b] JkGalaktus§f has requested to join the Guild!`)
    if (content == "promote") await uhg.test.server.broadcast(`§a[VIP] UHGuild was promoted from Member to Manager`)
    if (content == "demote") await uhg.test.server.broadcast(`§a[VIP] UHGuild was demoted from Manager to Member`)
    if (content == "fevent") await uhg.test.server.broadcast(`From §6[MVP§9+§6] Farmans: 0 0 0 0`)
    if (content == "event") await uhg.test.server.broadcast(`From §6[MVP§9+§6] Farmans: -77 86 65 0`)
    if (content.split(" ")[0] == "c") await uhg.test.server.broadcast(`§2Guild > §b[MVP§8+§b] Farmans §e[Gnrl]§f: !${content.split(" ")[1]} Honzu`)
  }
}

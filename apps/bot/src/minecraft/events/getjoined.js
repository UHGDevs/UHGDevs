const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
let bridge = require(`../bridge.js`)
let chat = require(`../send.js`)
module.exports = async (uhg, pmsg) => {
  console.log(pmsg)
  let api = await uhg.getApi(pmsg.username)
  if (api instanceof Object == false) return api
  let level = Math.floor(api.hypixel.level) || 0
  pmsg.send = `[${level}] ${pmsg.username} se chce připojit do guildy!\n https://plancke.io/hypixel/player/stats/${pmsg.username} (Discord: ${api.hypixel.links.DISCORD || undefined})`
  pmsg.buttons = new MessageActionRow()
    .addComponents(new MessageButton().setCustomId(`/g accept ${pmsg.username}`).setLabel('PŘIJMOUT').setStyle('SUCCESS'))
    .addComponents(new MessageButton().setCustomId('guild_denine').setLabel('ODMÍTNOUT').setStyle('DANGER'))
  pmsg.secondbuttons = new MessageActionRow()
    .addComponents(new MessageButton().setCustomId(`/g invite ${pmsg.username}`).setLabel('POZVAT ZNOVU').setStyle('PRIMARY'))
    .addComponents(new MessageButton().setCustomId('guild_denine').setLabel('ODMÍTNOUT').setStyle('DANGER'))
  bridge.guildjoin(uhg, pmsg)
  chat.send(uhg, pmsg)
}

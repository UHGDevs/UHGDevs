const { Collection, Permissions } = require('discord.js');

module.exports = async (uhg, client) => {
  console.log(`Discord Bot is online! (${uhg.dc.client.user.tag})`.bold.brightGreen)
  uhg.dc.client.user.setActivity(' Guild Chat', { type: 'WATCHING' });

  let guild = uhg.dc.client.guilds.cache.get("455751845319802880")
  if (!guild) return console.log("\nBot není na UHG dc\n".bgRed)

   let botSlashCmds = uhg.dc.slash.map(cmd => { return{ name: cmd.name, description: cmd.description||"", options: cmd.options || [], type: cmd.type, defaultPermission: cmd.permissions.length ? false : true } });
  botSlashCmds.push({ name: 'Profile Command', type: 'USER'})
  botSlashCmds.push({ name: 'verify', description: 'Verify command'})
  let cmds = await uhg.dc.client.application.commands.set(botSlashCmds)

  //console.log(cmds)
  
  uhg.dc.cache.channels = new Collection()
  if (uhg.settings.minecraft === true) {
    uhg.dc.cache.channels.set("guild", uhg.dc.client.channels.cache.get(uhg.getDiscordIds().channels.guild))
    uhg.dc.cache.channels.set("officer", uhg.dc.client.channels.cache.get(uhg.getDiscordIds().channels.officer))
  }
  else {
    uhg.dc.cache.channels.set("guild", uhg.dc.client.channels.cache.get(uhg.getDiscordIds().channels.botguild))
    uhg.dc.cache.channels.set("officer", uhg.dc.client.channels.cache.get(uhg.getDiscordIds().channels.botofficer))
  }
  uhg.dc.cache.channels.set("bot", uhg.dc.client.channels.cache.get("875503798733385779"))
  uhg.dc.cache.channels.set("achat", uhg.dc.client.channels.cache.get("530496801782890527"))

  let rServers = require('../../utils/serverroles.js')
  rServers.uhg(uhg)
  //rServers.bw(uhg)
}

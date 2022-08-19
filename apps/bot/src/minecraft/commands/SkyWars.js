const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
module.exports = {
  name: "SkyWars",
  aliases: ["sw", "skywars"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let skywars = api.hypixel.stats.skywars
      let overall = skywars.overall
      let message = `**SkyWars**: [${skywars.levelformatted}] **${api.username}** - ${uhg.f(overall.kills)}Kills ${uhg.f(overall.wins)}Wins ${uhg.f(overall.kdr)}KDR ${uhg.f(overall.wlr)}WLR ${Math.floor(skywars.playtime)}h (Main gamemode - ${skywars.main_mode})`
      let embed = new MessageEmbed()
      .setTitle(pmsg.command ? `**SkyWars** requested by ${pmsg.username}` : '**SkyWars**').setThumbnail('https://cdn.discordapp.com/attachments/875503798733385779/1000407603421118474/unknown.png').setColor("0x06ACEE")
      .addFields( {name:`[${skywars.levelformatted}] **${api.username}**`, value: `${uhg.f(overall.kills)}Kills ${uhg.f(overall.wins)}Wins ${uhg.f(overall.kdr)}KDR ${uhg.f(overall.wlr)}WLR ${Math.floor(skywars.playtime)}h\n(Main gamemode - ${skywars.main_mode})`, inline: true})
      //.setDescription(`${bedwars.levelformatted} **${api.username}**`)
      return {mc: message, dc:embed}
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v SkyWars příkazu!"
    }
  }
}

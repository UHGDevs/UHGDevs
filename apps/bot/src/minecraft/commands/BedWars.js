const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
module.exports = {
  name: "BedWars",
  aliases: ["bw", "bedwars"],
  run: async (uhg, pmsg) => {
    const f = uhg.f
    try {
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let bedwars = api.hypixel.stats.bedwars
      let overall = bedwars.overall

      let message = `**BedWars**: ${bedwars.levelformatted} **${uhg.dontFormat(api.username)}** - ${f(overall.finalKills)}Finals ${f(overall.wins)}Wins ${f(overall.fkdr)}FKDR ${f(overall.wlr)}WLR (Main gamemode - ${bedwars.main_mode})`

      let embed = new MessageEmbed()
      .setTitle('Bed Wars').setThumbnail('https://cdn.discordapp.com/attachments/875503798733385779/1000406344156844173/unknown.png').setColor("0x06ACEE")
      .setDescription(`**${bedwars.levelformatted} ${api.username}**\n\nWinstreak: \`${overall.winstreak}\``)
      .addFields(
        {name: 'ㅤ', value: `Wins: \`${uhg.f(overall.wins)}\`\nLosses: \`${uhg.f(overall.losses)}\`\nWLR: \`${uhg.f(overall.wlr)}\``, inline: true},
        {name: 'ㅤ', value: `Beds Broken: \`${uhg.f(overall.bedsBroken)}\`\nBeds Lost: \`${uhg.f(overall.bedsLost)}\`\nBBLR: \`${uhg.f(overall.bblr)}\``, inline: true},
        {name: 'ㅤ', value: `Final Kills: \`${uhg.f(overall.finalKills)}\`\nFinal Deaths: \`${uhg.f(overall.finalDeaths)}\`\nFKDR: \`${uhg.f(overall.fkdr)}\``, inline: true},
        {name: 'ㅤ', value: `Kills: \`${uhg.f(overall.kills)}\`\nDeaths: \`${uhg.f(overall.deaths)}\`\nKDR: \`${uhg.f(overall.kdr)}\``, inline: true}
      )

      if (pmsg.command) embed.setFooter({text:`Command requested by ${uhg.dontFormat(pmsg.username)}`})
      //.setDescription(`${bedwars.levelformatted} **${api.username}**`)
      return {mc: message, dc:embed}
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v BedWars příkazu!"
    }
  }
}

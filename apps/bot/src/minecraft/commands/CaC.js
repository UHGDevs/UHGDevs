const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "CaC",
  aliases: ["cac", "crops", "crims", "cropsandcrims", "cvc", "copsvcrims", "copsacrims", "copsvscrims", "cvsc"],
  run: async (uhg, pmsg) => {
    const f = uhg.f
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let cac = api.hypixel.stats.cac
      let overall = cac.overall
      let defusal = cac.defusal
      let dm = cac.deathmatch
      let gg = cac.gungame
      let message = `**CaC**: **${uhg.dontFormat(api.username)}** - ${f(overall.wins)} Wins | ${f(overall.kills)} Kills | ${f(overall.headshotkills)} Headshots | ${f(overall.kdr)} KDR | ${f(overall.wlr)} WLR | ${f(defusal.bombsplanted)} Bombs Planted and ${f(defusal.bombsdefused)} Defused`
      
      let besttime = `${uhg.toTime(gg.besttime, true).m}m ${uhg.toTime(gg.besttime, true).s}s`; 
      if (gg.besttime/1000 < 60) {
        besttime = `${uhg.toTime(gg.besttime, true).s}s`
      }

      let embed = new MessageEmbed()
      .setTitle('Cops and Crims').setThumbnail('https://hypixel.net/styles/hypixel-v2/images/game-icons/CVC-64.png').setColor("0x4f534e")
      .setDescription(`**${api.username}**`)
      .addFields(
        {name: 'Defusal', value: `Wins: \`${uhg.f(defusal.wins)}\`\nLosses: \`${uhg.f(defusal.losses)}\`\nWLR: \`${uhg.f(defusal.wlr)}\`\nKills: \`${uhg.f(defusal.kills)}\`\nDeaths: \`${uhg.f(defusal.deaths)}\`\nKDR: \`${uhg.f(defusal.kdr)}\`\nBombs Defused: \`${uhg.f(defusal.bombsdefused)}\`\nBombs Planted: \`${uhg.f(defusal.bombsplanted)}\`\n`, inline: true},
        {name: 'Deathmatch', value: `Wins: \`${uhg.f(dm.wins)}\`\nLosses: \`${uhg.f(dm.losses)}\`\nWLR: \`${uhg.f(dm.wlr)}\`\nKills: \`${uhg.f(dm.kills)}\`\nDeaths: \`${uhg.f(dm.deaths)}\`ㅤㅤㅤ\nKDR: \`${uhg.f(dm.kdr)}\``, inline: true},
        {name: 'Gun Game', value: `Wins: \`${uhg.f(gg.wins)}\`\nLosses: \`${uhg.f(gg.losses)}\`\nWLR: \`${uhg.f(gg.wlr)}\`\nKills: \`${uhg.f(gg.kills)}\`\nDeaths: \`${uhg.f(gg.deaths)}\`\nKDR: \`${uhg.f(gg.kdr)}\`\nBest Time: \`${besttime}\``, inline: true},
      )

      if (pmsg.command) embed.setFooter({text:`Command requested by ${uhg.dontFormat(pmsg.username)}`})

      return {mc: message, dc:embed}
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v CaC příkazu!"
    }
  }
}

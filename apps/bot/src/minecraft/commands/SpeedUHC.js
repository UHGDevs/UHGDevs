const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "SpeedUHC",
    aliases: ["speeduhc", "speedultrahardcore", "suhc"],
    run: async (uhg, pmsg) => {
      const f = uhg.f
      try{
        let nickname = pmsg.nickname
        let api = await uhg.getApi(nickname)
        if (api instanceof Object == false) return api
        let suhc = api.hypixel.stats.speeduhc
        let message = `**SpeedUHC**: [${suhc.level}✫] ${api.username} - ${f(suhc.wins)}Wins ${f(suhc.kills)}Kills ${f(suhc.wlr)} ${f(suhc.kdr)}KDR (${f(suhc.score)} Score)`

        let embed = new MessageEmbed()
            .setTitle('SpeedUHC')
            .setColor(0x09fff5)
            .setThumbnail("https://hypixel.net/styles/hypixel-v2/images/game-icons/SpeedUHC-64.png")
            .setDescription(`**[${suhc.level}✫] ${api.username}**\n\nScore: \`${suhc.score}\`\nMastery: \`${suhc.masterperk}\``)
            .setFields(
                { name: `ㅤ`, value: `Wins: \`${suhc.wins}\`\nLosses: \`${suhc.losses}\`\nWLR: \`${suhc.wlr}\`\n`, inline: true },
                { name: `ㅤ`, value: `Kills: \`${suhc.kills}\`\nDeaths: \`${suhc.deaths}\`\nKDR: \`${suhc.kdr}\`\n`, inline: true }
            )

        if (pmsg.command) embed.setFooter({text:`Command requested by ${uhg.dontFormat(pmsg.username)}`})
        
        return {mc: message, dc: embed}
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v SpeedUHC příkazu!"
      }
    }
  }
  
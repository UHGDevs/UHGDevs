const { MessageEmbed } = require("discord.js")

module.exports = {
  name: "BuildBattle",
  aliases: ["bb", "build", "buildbattle"],
  run: async (uhg, pmsg) => {
    const f = uhg.f
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let bb = api.hypixel.stats.bb
      let message = `**BuildBattle**: ${bb.title} **${api.username}** - ${f(bb.overall.wins)} Wins ${f(bb.score)} Score`

      let embed = new MessageEmbed()
        .setTitle('Build Battle')
        .setColor(0x086405)
        .setDescription(`${bb.title} **${api.username}**\n\nScore: \`${bb.score}\`\nCorrect Guesses: \`${bb.guess.guesses}\``)
        .setThumbnail('https://hypixel.net/styles/hypixel-v2/images/game-icons/BuildBattle-64.png')
        .setFields(
          { name: 'ㅤ', value: `Wins: \`${bb.overall.wins}\`\nLosses: \`${bb.overall.losses}\`\nWLR: \`${bb.overall.wlr}\``, inline: true },
          { name: 'ㅤ', value: `Pro Wins: \`${bb.pro.wins}\`\nGTB Wins: \`${bb.guess.wins}\``, inline: true }
        )

      if (pmsg.command) embed.setFooter({text: `Command requested by ${api.username}`})
      
      return {mc: message, dc: embed}
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v BuildBattle příkazu!"
    }
  }
}

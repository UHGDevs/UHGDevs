const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
module.exports = {
  name: "Age",
  aliases: ["age", "og", "created"],
  run: async (uhg, pmsg) => {
    const f = uhg.f
    try {
      let api = (uhg.data.verify ? uhg.data.verify.find(n => n.nickname.toLowerCase() == pmsg.nickname.toLowerCase()): null) || await uhg.api.call(pmsg.nickname, ['mojang'], { verify: pmsg.verify_data })
      if (api.success === false) return api.reason
      if (!api.date) api = await uhg.api.call(pmsg.nickname, ['mojang'], { verify: pmsg.verify_data })
      if (api.success === false) return api.reason
      
      let message = `**${api.nickname || api.username}** - ${api.date.getDate()}. ${api.date.getMonth() + 1}. ${api.date.getFullYear()}`

      let embed = new MessageEmbed()
      .setTitle('Minecraft account AGE').setThumbnail('https://cdn.discordapp.com/attachments/875503798733385779/1015701045600604260/unknown.png').setColor("0x06ACEE")
      .setDescription(`<t:${Math.round(Number(new Date(api.date.getTime()))/1000)}:R>\n<t:${Math.round(Number(new Date(api.date.getTime()))/1000)}:D>`)

      if (pmsg.command) embed.setFooter({text:`Command requested by ${pmsg.username}`})
      return {mc: message, dc:embed}
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Age příkazu!"
    }
  }
}

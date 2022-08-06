const { MessageEmbed } = require("discord.js")
module.exports = {
  name: "Help",
  aliases: ["help"],
  run: async (uhg, pmsg) => {
    try{
      let message = `[!help] | Ahoj, já jsem UHG Guild BOT, všechny dostupné příkazy najdeš v !commands`
      let embed = new MessageEmbed()
        .setTitle("**Help**")
        .setThumbnail(uhg.dc.client.user.displayAvatarURL())
        .setDescription("Ahoj, já jsem UHG Guild BOT, všechny dostupné příkazy najdeš v !commands")
        .setColor("0x06ACEE")
      return {mc: message, dc: embed}
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Help příkazu!"
    }
  }
}

const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
module.exports = {
  name: "Remove",
  aliases: ["remove"],
  run: async (uhg, pmsg) => {
    try {
        const PERMS = ["Farmans", "Honzu", "unisdynasty", "DavidCzPdy", "0hBlood", "SolidL1m3", "Smolda", "Corruptedoslav", "macek2005"]
        if (!PERMS.includes(pmsg.username)) return "Nemáš permise"
        let args = pmsg.args
        if (!args) return "Nezadal jsi jméno"
        args = args.split(" ").filter(n => n)
        if (!args.length) return "Nezadal jsi jméno"

        let api = await uhg.getApi(args[0], ["hypixel", "mojang"])
        if (api instanceof Object == false) return api
        uhg.mongo.run.delete("stats", "stats", {_id: api.uuid})
        let message = `**${api.username}** byl odebrán do databáze`
        return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Remove příkazu!"
    }
  }
}

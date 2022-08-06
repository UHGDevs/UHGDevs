const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "apiuses",
    aliases: ["api", "apiuses", "apikey", "key", "uses", "apiuse"],
    allowedids: [],
    platform: "dc",
    run: async (uhg, message, content) => {
      try {
        let api = await uhg.getApi("fb811b92561e434eb5b6ef04695cc49a", ["key"])
        if (api instanceof Object == false) return api

        let embed = new MessageEmbed().setTitle(`**Kolikrát bylo API použito?**`).addFields(
            { name: "**Celkem**", value: `**API Key 1:** ${uhg.f(api.key.totaluses)}`, inline: true},
            { name: "ㅤ", value: "ㅤ", inline: true},
            { name: "ㅤ", value: `**API Key 2:** ${uhg.f(api.key.totaluses2)}`, inline: true },
            { name: "**Za minutu**", value: `**API Key 1:** ${uhg.f(api.key.uses)}`, inline: true },
            { name: "ㅤ", value: "ㅤ", inline: true},
            { name: "ㅤ", value: `**API Key 2:** ${uhg.f(api.key.uses2)}`, inline: true }

        )

        message.channel.send({ embeds: [embed] })

      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v apiuses příkazu!"
      }
    }
  }

const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "randomPicker",
    aliases: ["random", "picker"],
    allowedids: ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"],
    platform: "dc",
    run: async (uhg, message, content) => {
      try {
        if (!content) return "Nezadal jsi obsah"
        let args = content.split(" ").filter(n => n)
        if (!args.length) return "Nezadal jsi obsah"

        let db = await uhg.mongo.run.get("general", "uhg")

        let players = [];
        let ids = [];
        for (let i in args) {
            let api = await uhg.getApi(args[i], ["mojang"])
            if (api instanceof Object == false) return api

            args[i] = api.username

            let dbFiltered = db.filter(n => n.username == args[i])
            if (!dbFiltered.length) {
                return "Jedno z jmen je nesprávné"
            }
            players.push(dbFiltered[0].username)
            ids.push(dbFiltered[0]._id)
        }

        let randomNumber = Math.random()
        console.log(randomNumber)
        let index = Math.floor(randomNumber*players.length)
        console.log(index)

        let embed = new MessageEmbed().setTitle(`**Výherce GEXP celodenního eventu**`).setDescription(`*8.10.2022*`).setColor(0x11d925).addFields(
            { name: '‎ ', value: '‎ ', inline: false },
            { name: '**VÝHERCE**', value: players[index], inline: true },
            { name: '‎ ', value: `<@!${ids[index]}>`, inline: true },
            { name: '‎ ', value: `Do slosování bylo zapojeno dohromady ${players.length} lidí`},
            { name: '‎ ', value: '‎ ', inline: false },
        ).setFooter({ text: 'UHGDevs' })

        message.channel.send({ embeds: [embed] })
  
        return
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v randomPicker příkazu!"
      }
    }
  }
  
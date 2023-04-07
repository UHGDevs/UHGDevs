const { MessageEmbed } = require('discord.js');

module.exports = {
    name: "treasurehunteradd",
    aliases: ["thadd", "th"],
    allowedids: ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"],
    platform: "dc",
    run: async (uhg, message, content) => {
      try {
        let picture;
        message.attachments.forEach(n => {picture = n.attachment});
        if (!picture) return "Neposlal jsi obrázek"
        let coords = content.trim().split(" ")
        if (coords.length < 4) return "Zadané souřadnice nejsou zadané"
        let x = Number(coords[0])
        let y = Number(coords[1])
        let z = Number(coords[2])
        if (x === NaN || y === NaN || z === NaN) return "Zadané souřadnice nejsou čísla"

        let database = await uhg.mongo.run.get("general", "treasure")

        let id = database.length
        if (database.filter(n => n._id == id ).length) {
          for (let i = 0; i < database.length; i++) {
            if (database[i]._id !== i) {
              id = i
              break
            }
          }

        }
        const data = {
          _id: id,
          x: x,
          y: y,
          z: z,
          coords: `${x} ${y} ${z}`,
          url: picture,
          guesses: 0,
          names: []
        }

        data.lobby = content.replace(data.coords, "").trim()


        let embed = new MessageEmbed().setColor('GREY').setTitle(`Obrázek #${data._id}`).setFooter({ text: 'UHG easter EVENT' }).setImage(data.url)

        let channel = uhg.dc.client.channels.cache.get('962729811518820382')

        let msg = await channel.send({ embeds: [embed] })
        data.msgID = msg.id

        uhg.mongo.run.post("general", "treasure", data, false)

        return `K souřadnicím ${data.coords} byl přiřazen obrázek č. ${data._id}`
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v treasurehunteradd příkazu!"
      }
    }
  }
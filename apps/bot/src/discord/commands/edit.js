const canva = require('uhg-canvas')

const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "edit",
  aliases: ["cmdedit", 'commandedit'],
  allowedids: ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      let args = String(content).split(' ')

      let cmd = args[0] || 'general'

      let data = await uhg.mongo.run.get('general', 'commands', { _id: cmd }).then(n=> n[0]|| null)
      if (!data) return 'Command nebyl nalezen'

      let api = await uhg.api.call(args[1] || 'DavidCzPdy', ['hypixel', 'guild'])
      if (!api.success) return api.reason
      
      let img = await canva.run(data, api)
      if (!img.name) return img


      const but_pos = new MessageActionRow()
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_left`).setStyle('PRIMARY').setLabel('◄'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_right`).setStyle('PRIMARY').setLabel('►'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_up`).setStyle('PRIMARY').setLabel('▲'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_down`).setStyle('PRIMARY').setLabel('▼'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_krok`).setStyle('PRIMARY').setLabel('Krok: 1'));


      let msg = await message.channel.send({ components: [but_pos], files: [img] })


      msg.cache = img.data

      data = img.data
    

    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v edit příkazu!"
    }
  }
}

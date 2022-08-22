const canva = require('uhg-canvas')

const { MessageSelectMenu, MessageButton, MessageActionRow } = require("discord.js");
const { stat } = require('fs');

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


      let but_null = ((a, b='SECONDARY') => {return new MessageButton().setCustomId(`ECMD_${cmd}_null_${a}`).setStyle(b).setDisabled(true).setLabel(" ")})
      const but1 = new MessageActionRow()
        .addComponents(but_null(1))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_up`).setStyle('PRIMARY').setLabel('▲'))
        .addComponents(but_null(2))
        .addComponents(but_null(3))
        .addComponents(but_null(4));

      const but2 = new MessageActionRow()
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_left`).setStyle('PRIMARY').setLabel('◄'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_krok`).setStyle('SECONDARY').setLabel('1 px'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_right`).setStyle('PRIMARY').setLabel('►'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_modal_settings`).setStyle('SECONDARY').setEmoji('<:settings:1011235478164480000>'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_get_info`).setStyle('SECONDARY').setEmoji('<:info:1011235456429604864>'));
        
      const but3 = new MessageActionRow()
        .addComponents(but_null(6))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_down`).setStyle('PRIMARY').setLabel('▼'))
        .addComponents(but_null(7))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_discard`).setStyle('DANGER').setEmoji('<:false:1011238405943865355>'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_save`).setStyle('SUCCESS').setEmoji('<:true:1011238431482974278>'));

        let stat_options = new MessageSelectMenu().setCustomId(`ECMD_${cmd}_set_stat`)
        stat_options.options = []

        data.fields.forEach((e, i) => {
          stat_options.options.push({ label: e.name, value: e.stat,emoji: null, default: i==0 ? true: false})
        });

        const row = new MessageActionRow().addComponents(stat_options);


      let msg = await message.channel.send({ components: [row, but1, but2, but3], files: [img] })


      msg.cache = data
      msg.api = api
    

    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v edit příkazu!"
    }
  }
}

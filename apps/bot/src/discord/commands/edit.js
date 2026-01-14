//const canva = require('../../../../canvas')

const { MessageSelectMenu, MessageButton, MessageActionRow } = require("discord.js");
const { stat } = require('fs');

module.exports = {
  name: "edit",
  aliases: ["cmdedit", 'commandedit'],
  allowedids: ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      return "Chybi CANVAS library"
      let args = String(content).split(' ')

      let cmd = args[0] || 'general'

      let data = await uhg.mongo.run.get('general', 'commands', { _id: cmd }).then(n=> n[0]|| null)
      if (!data) return 'Command nebyl nalezen'

      let api = await uhg.api.call(args[1] || 'DavidCzPdy', ['hypixel', 'guild', 'online'], { premium: true} )
      if (!api.success) return api.reason
      
      //let img = await canva.run(data, api)
      //if (!img.name) return img


      let but_null = ((a, b='SECONDARY') => {return new MessageButton().setCustomId(`ECMD_${cmd}_null_${a}`).setStyle(b).setDisabled(true).setLabel(" ")})
      const but1 = new MessageActionRow()
      .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_rotate`).setStyle('SECONDARY').setEmoji('<:rotate:1012443366421696512>'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_up`).setStyle('PRIMARY').setLabel('▲'))
        .addComponents(but_null(2))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_modal_settings-graphic`).setStyle('SECONDARY').setEmoji('<:settings_graphic:1011333239434117130>'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_modal_settings-info`).setStyle('SECONDARY').setEmoji('<:settings_info:1011333260384665610>'));

      const but2 = new MessageActionRow()
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_left`).setStyle('PRIMARY').setLabel('◄'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_krok`).setStyle('SECONDARY').setLabel('1 px'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_right`).setStyle('PRIMARY').setLabel('►'))
        .addComponents(but_null(3))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_get_info`).setStyle('SECONDARY').setEmoji('<:info:1011235456429604864>'));
        
      const but3 = new MessageActionRow()
        .addComponents(but_null(6))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_move_down`).setStyle('PRIMARY').setLabel('▼'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_sync`).setStyle('SECONDARY').setEmoji('<:refresh:1011620798278160384>'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_discard`).setStyle('DANGER').setEmoji('<:false:1011238405943865355>'))
        .addComponents(new MessageButton().setCustomId(`ECMD_${cmd}_set_save`).setStyle('SUCCESS').setEmoji('<:true:1011238431482974278>'));

        let stat_options = new MessageSelectMenu().setCustomId(`ECMD_${cmd}_set_stat`)
        stat_options.options = []

        data.fields.forEach((e, i) => {
          if (i >= 25) return
          stat_options.options.push({ label: e.name, value: e.stat, emoji: null, default: i==0 ? true: false})
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

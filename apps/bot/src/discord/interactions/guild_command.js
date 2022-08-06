const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

let denined =  new MessageActionRow().addComponents(new MessageButton().setCustomId('guild_denined').setLabel('ODMÍTNUTO').setStyle('DANGER').setDisabled(true))
let accepted =  new MessageActionRow().addComponents(new MessageButton().setCustomId('guild_accepted').setLabel('PŘIJATO').setStyle('SUCCESS').setDisabled(true))
let invited =  new MessageActionRow().addComponents(new MessageButton().setCustomId('guild_invited').setLabel('POZVÁNO').setStyle('PRIMARY').setDisabled(true))

module.exports = async (uhg, interaction) => {

  await interaction.update({ type:6 })
  let msg = interaction.message

  let now = Number(new Date())
  let expire = interaction.message.expire || Number(new Date()) - 50000

  let nickname = msg.components[0].components[0].customId.split(" ")[2]

  if (!msg.pmsg) msg.pmsg = {username: nickname, secondbuttons: new MessageActionRow().addComponents(new MessageButton().setCustomId(`/g invite ${nickname}`).setLabel('POZVAT ZNOVU').setStyle('PRIMARY')).addComponents(new MessageButton().setCustomId('guild_denine').setLabel('ODMÍTNOUT').setStyle('DANGER'))}

  if (uhg.members.includes(msg.pmsg.username)) return await interaction.editReply({ components: [accepted] })
  if (interaction.customId === "guild_denine") return await interaction.editReply({ components: [denined] })

  if (expire < now && !interaction.customId.includes("/g invite ")) return await interaction.editReply({ components: [msg.pmsg.secondbuttons] })

  if (interaction.customId.includes("/g accept ")) {
    if (expire > now){
      uhg.mc.send.push({send: `/g accept ${nickname}`, onetime:true})
      await interaction.editReply({ components: [accepted] })
    } else {
      uhg.mc.send.push({send: `/g invite ${nickname}`, onetime:true})
      await interaction.editReply({ components: [invited] })
    }
  } else if (interaction.customId.includes("/g invite ")) {
    await interaction.editReply({ components: [invited] })
    uhg.mc.send.push({send: `/g invite ${nickname}`, onetime:true})
  }

}

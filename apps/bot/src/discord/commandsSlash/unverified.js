const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');
module.exports = {
  name: "unverified",
  description: 'Zobrazí uhg guild membery, kteří nejsou verifikovaní',
  permissions: [ {type: 'USER', id: '378928808989949964', permission: true }, {type: 'ROLE', id: '530504567528620063', permission: true, guild: '455751845319802880' }, {type: 'ROLE', id: '475585340762226698', permission: true, guild: '455751845319802880' }, {type: 'ROLE', id: '537252847025127424', permission: true, guild: '455751845319802880' }, {type: 'ROLE', id: '530504766225383425', permission: true, guild: '455751845319802880' }  ],
  type: "slash",
  run: async (uhg, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: false }).catch(() => {});
      let unDC = []
      let unUuid = []
      let dVerify = await uhg.mongo.run.get("general", "verify")
      uhg.data.verify = dVerify

      let api = await uhg.getApi("64680ee95aeb48ce80eb7aa8626016c7", ["guild"])
      if (api instanceof Object == false) return console.log(api)
      for (let member of api.guild.all.members) {
        let vMember = dVerify.filter(n => n.uuid == member.uuid)
        if (!vMember.length) unUuid.push(member.uuid);
        else {
          let uhgmember = uhg.dc.client.guilds.cache.get('455751845319802880').members.cache.get(vMember._id)
          if (uhgmember) unDC.push(vMember)
        }
      }
      unNames = []
      for (let uuid of unUuid) {
        let autoverify = false
        let uApi = await uhg.api.call(uuid, ["guild", 'hypixel'])
        if (!uApi.success) {unNames.push({name:uuid}); continue;}
        let joined = Math.floor((new Date().getTime()-uApi.guild.member.joined)/ 86400000)
        if (uApi.hypixel.links.DISCORD) {
          let discord = uhg.dc.client.users.cache.find(n => `${n.username}#${n.discriminator}` == uApi.hypixel.links.DISCORD)
          if (discord) {
            await uhg.mongo.run.post("general", "verify", { _id: discord.id, uuid: uApi.uuid, nickname: uApi.username, names: uApi.names, textures: uApi.textures, date: uApi.date })
            autoverify = true
            uhg.dc.client.channels.cache.get('548772550386253824').send({ content: `Autoverified ${uApi.username} - <@${discord.id}> (${uApi.hypixel.links.DISCORD})`})
          }
        }
        unNames.push( {name:uApi.username, joined: joined, date: `<t:${Math.round(uApi.guild.member.joined/1000)}:R>`, lastLogin: uApi.hypixel.lastLogin, lastOnline: `<t:${Math.round(uApi.hypixel.lastLogin/1000)}:R>`, links: uApi.hypixel.links, autoverify: autoverify} )
      }
      //console.log(unNames)

      uhg.data.unverified = unNames

      let embed = new MessageEmbed().setTitle(`**UNVERIFIED UHG members**`)
      let desc = []
      uhg.data.unverified.forEach(n => {
        let zprava = `**${n.name}**:`
        if (n.joined) zprava = zprava + ` joined: ${n.date}`
        if (n.lastLogin) zprava = zprava + ` last login: ${n.lastOnline}`
        if (n.links && n.links.DISCORD) zprava = zprava + ` dc: ${n.links.DISCORD}`
        if (n.autoverify) zprava = zprava + ` ✅`
        desc.push(zprava)
      });
      if (unDC.length) desc.push("")
      unDC.forEach(n => {
        desc.push(`**${n.nickname}** není na UHG discordu`)
      });

      embed.setDescription(desc.join('\n'))
      return interaction.editReply({ /*content: send.join("\n"),*/ embeds: [embed] })
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'UNVERIFIED slash command')] })
        return "Chyba v sůash unverified příkazu!"
    }
  }
}

const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

const fs = require('fs');
//const canva = require('../../../../canvas')

module.exports = {
  name: "profile",
  type: "slash",
  description: 'Zobrazí profil hráče',
  permissions: [],
  options: [
    {
      name: 'player',
      description: 'Koho chceš vidět profil?',
      type: 'STRING',
      required: false
    },
    {
      name: 'user',
      description: 'Koho chceš vidět profil?',
      type: 'USER',
      required: false
    },
    {
      name: 'style',
      description: 'Jaký chceš zobrazit styl?',
      type: 'STRING',
      required: false,
      choices: [
        { value: 'embed', name: 'Embed' },
        { value: 'picture', name: 'Fotka' },
      ]
    },
  ],
  run: async (uhg, interaction) => {
    if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: false }).catch(() => {});
    try {
      let verUser = (uhg.data.verify.length ? uhg.data.verify.filter(n => n._id == interaction.targetId || n._id == interaction.user.id) : await uhg.mongo.run.get("general", "verify", { _id: interaction.targetId||interaction.user.id}))[0]
      let user = interaction.options.getString('player') || (verUser ? verUser.nickname : null) || interaction.member.nickname || interaction.user.username || '___bc__f_ar'
      let dcuser = interaction.options.getUser('user')
      if (dcuser) {
        user = uhg.data.verify.find(n => n._id == dcuser.id)
        if (!user) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`**Error**`).setColor('RED').setDescription(`${dcuser} není verifikovaný`)] })
        user = user.uuid
      }
      
      let api = await uhg.api.call(user, ["hypixel", 'guild', 'online'], { verify: uhg.data.verify?.find(n => n._id == interaction.user.id) || {}})
      if (!api.success) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`**Error v api**`).setColor('RED').setDescription(api.reason)] })

      let style = interaction.options.getString('style') || 'picture'
      if (false/*style == 'picture'*/) {
        let data = await uhg.mongo.run.get('general', 'commands', { _id: 'general' }).then(n=> n[0] || null)
        if (!data) return interaction.editReply({ content: '\`general\` příkaz nebyl nalezen, kontaktuj prosím developera' })

       // let img = await canva.run(data, api)
        //return interaction.editReply({ files: [img] })
      }

      let stats = uhg.data.stats && uhg.data.stats.length ? uhg.data.stats.find(n => n.uuid == api.uuid) : await uhg.mongo.run.get("stats", "stats", { uuid: api.uuid }).then(n => n[0] || null)
      let dUhg = uhg.data.uhg && uhg.data.uhg.length ? uhg.data.uhg.find(n => n.uuid == api.uuid) : await uhg.mongo.run.get("general", "uhg", {uuid: api.uuid}).then(n => n[0] || null)
      let guild = uhg.data.guild && uhg.data.guild.length ? uhg.data.guild.find(n => n.name == api.guild.name) : await uhg.mongo.run.get("stats", "guild", {name: api.guild.name}).then(n => n[0] || null)
      let verify = uhg.data.verify && uhg.data.verify.length ? uhg.data.verify.find(n => n.nickname == api.username) : await uhg.mongo.run.get("general", "verify", {nickname: api.username}).then(n => n[0] || null)

      let embed = new MessageEmbed().setTitle(`**Profil hráče ${uhg.dontFormat(api.hypixel.username)}**`).setURL(`https://plancke.io/hypixel/player/stats/${api.hypixel.username}`).addFields(
          { name: `Username`, value: `${uhg.dontFormat(api.hypixel.username)}`, inline: true },
          { name: `UUID`, value: `${api.hypixel.uuid}`, inline: true },
          { name: `ㅤ`, value: `ㅤ`, inline: false},
          { name: `Level`, value: `${uhg.f(api.hypixel.level)}`, inline: true },
          { name: `Rank`, value: `${api.hypixel.rank}`, inline: true},
          { name: `Last Login`, value: api.hypixel.lastLogin>0 ? `<t:${Math.round(api.hypixel.lastLogin/1000)}:R>`: '\`api off\`', inline: true},
         // { name: `ㅤ`, value: `ㅤ`, inline: true},
          { name: `User Language`, value: `${api.hypixel.userLanguage}`, inline: true }
      )

      if (api.guild.guild) embed.addFields(
        { name: `ㅤ`, value: `ㅤ`, inline: false},
        { name: `Guild`, value: `${uhg.dontFormat(api.guild.name)}`, inline: true},
        { name: `Guild Rank`, value: `${uhg.dontFormat(api.guild.member.rank)}`, inline: true},
        { name: `Joined`, value: `<t:${Math.round(api.guild.member.joined/1000)}:R>`, inline: true}
      )

      if (guild) {
        let member = guild.members.find(n => n.uuid == api.uuid)
        if (member) {
          let monthlyGEXPkeys = Object.keys(member.exp.daily).filter(n => n.startsWith(new Date().toISOString().slice(0, 7)))
          let monthlyGEXP = 0
          for (let den of monthlyGEXPkeys) {
            monthlyGEXP += member.exp.daily[den] || 0
          }
          let weeklyGEXPkeys = Object.keys(guild.members[0].exp.daily).slice(0, new Date().getDay() || 7)
          let weeklyGEXP = 0
          for (let den of weeklyGEXPkeys) {
            weeklyGEXP += member.exp.daily[den] || 0
          }
          embed.addFields(
            { name: `WEEKLY GEXP`, value: `\`${uhg.f(weeklyGEXP)}\``, inline: true},
            { name: `MONTHLY GEXP`, value: `\`${uhg.f(monthlyGEXP)}\``, inline: true},
            { name: `TOTAL GEXP`, value: `\`${uhg.f(Object.values(member.exp.daily).reduce((a, b) => a + b))}\``, inline: true}
          )
        }
      }



      embed.addFields({ name: 'ㅤ', value: 'ㅤ', inline: false})
      if (api.hypixel.links.DISCORD) {
        let member;
        if (verify || dUhg) member = interaction.guild.members.cache.get(verify._id || dUhg._id)
       
        embed.addFields({ name: 'Discord:', value: member ? `<@${member.id}>` :  uhg.dontFormat(api.hypixel.links.DISCORD), inline: true})
      }

      embed.addFields({ name: 'Verified', value: verify ? '✅':'🟥', inline: true })
      if (api.guild.name == 'UltimateHypixelGuild' || dUhg || stats) {
       embed.addFields({ name: 'UHG Database', value: (dUhg ? '✅':'🟥') + ' | ' +(stats ? `✅ - <t:${Math.round(stats.updated/1000)}:R>`: '🟥'), inline: true })
      }

      return interaction.editReply({ embeds: [embed] })
    } catch (e) {
        interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'PROFILE Slash command')] })
        return
    }
  }
}

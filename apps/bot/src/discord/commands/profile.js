const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "profile",
    aliases: ["p"],
    allowedids: [],
    platform: "dc",
    run: async (uhg, message, content) => {
      try {
        let args = content.split(" ").filter(n => n)
        let args1 = args[0] || message.author.username

        let stats;
        if (args1.length > 15) stats = uhg.mongo.run.get("stats", "stats", {uuid: args1})
        else stats = uhg.mongo.run.get("stats", "stats", {username: args1})
        let api = await uhg.getApi(args1, ["api", "hypixel", "mojang", "guild"])
        if (api instanceof Object == false) return api

        let dUhg = uhg.mongo.run.get("general", "uhg", {uuid: api.uuid})
        let verify = await uhg.mongo.run.get("general", "verify")
        uhg.data.verify = verify

        let embed = new MessageEmbed().setTitle(`**Profil hráče ${uhg.dontFormat(api.hypixel.username)}**`).setURL(`https://plancke.io/hypixel/player/stats/${api.hypixel.username}`).addFields(
          { name: `Username`, value: `${uhg.dontFormat(api.hypixel.username)}`, inline: true },
          { name: `UUID`, value: `${api.hypixel.uuid}`, inline: true },
          { name: `ㅤ`, value: `ㅤ`, inline: false},
          { name: `Level`, value: `${uhg.f(api.hypixel.level)}`, inline: true },
          { name: `Rank`, value: `${api.hypixel.rank}`, inline: true},
          { name: `Last Login`, value: `<t:${Math.round(api.hypixel.lastLogin/1000)}:R>`, inline: true},
          { name: `AP`, value: `${uhg.f(api.hypixel.aps)}`, inline: true},
          { name: `User Language`, value: `${api.hypixel.userLanguage}`, inline: true },
          { name: `First login`, value: `<t:${Math.round(api.hypixel.firstLogin/1000)}:R>`, inline: true},
          { name: `ㅤ`, value: `ㅤ`, inline: false}
      )

      if (api.hypixel.nicks.length > 1) {
        embed.addField(`${api.hypixel.nicks.length} nicks`, uhg.dontFormat(api.hypixel.nicks.join(', ')), false)
      }

      if (api.guild.guild) embed.addFields(
        { name: `ㅤ`, value: `ㅤ`, inline: false},
        { name: `Guild`, value: `${uhg.dontFormat(api.guild.name)}`, inline: true},
        { name: `Guild Rank`, value: `${uhg.dontFormat(api.guild.member.rank)}`, inline: true},
        { name: `Joined`, value: `<t:${Math.round(api.guild.member.joined/1000)}:R>`, inline: true}
      )

      dUhg = await dUhg
      dUhg = dUhg[0]

      verify = verify.filter(n => n.uuid == api.uuid)
      embed.addField('ㅤ', 'ㅤ', false)
      if (api.hypixel.links.DISCORD) {
        let member;
        embed.addField('Discord:', uhg.dontFormat(member ? `<@${member.id}>` : api.hypixel.links.DISCORD), true)
      }

      embed.addField('Verified', verify.length ? '✅':'🟥', true)
      stats = await stats
      if (api.guild.name == 'UltimateHypixelGuild' || dUhg || stats.length) {
        embed.addField('UHG Database', (dUhg ? '✅':'🟥') + ' | ' +(stats.length ? `✅ - <t:${Math.round(stats[0].updated/1000)}:R>`: '🟥'), true)
      }
        message.channel.send({ embeds: [embed] })

      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v profile příkazu!"
      }
    }
  }

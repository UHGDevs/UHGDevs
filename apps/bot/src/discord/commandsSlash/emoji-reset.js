module.exports = {
    name: 'emoji-reset',
    description: 'Zrušit Discord emotikon ze svého jména',
    permissions: [{ id: '312861502073995265', type: 'USER', permission: true}, {type: 'ROLE', id: '684069130478813226', guild: '455751845319802880', permission: true}],
    type: 'slash',
    run: async (uhg, interaction, args) => {
  
      await interaction.deferReply({ ephemeral: true }).catch(() => {});

      try {  
        let db = (await uhg.mongo.run.get("general", "verify", {_id:interaction.user.id}))[0]
        if (!db.emoji) return interaction.editReply({embeds: [{title: "Nemáš emoji ve jméně", color: "RED"}]});
        let emoji = db.emoji
        await uhg.mongo.run.update("general", "verify", {_id:interaction.user.id}, {emoji: null})
        let guild = uhg.dc.client.guilds.cache.get("455751845319802880")
        let member = await guild.members.fetch()
        member = member.filter(n => n.user.id == interaction.user.id)
        member.first().setNickname(`${db.nickname}`)
        interaction.editReply({embeds: [{title: "Emoji bylo úspěšně zrušeno", description: `\`${emoji}\``, color: "GREEN"}]})
        return
      } catch (e) {
        if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'emoji Slash Command')] })
        else console.log(String(e).bgRed + ' neni loaded')
        return "Chyba v emoji reset slash commandu!"
      }
    }
  }
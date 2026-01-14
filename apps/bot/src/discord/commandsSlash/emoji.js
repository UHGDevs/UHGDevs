module.exports = {
  name: 'emoji',
  description: 'Vyber si Discord emotikon, který bude za tvým jménem',
  permissions: [{ id: '312861502073995265', type: 'USER', permission: true}, { id: '378928808989949964', type: 'USER', permission: true}, {type: 'ROLE', id: '684069130478813226', guild: '455751845319802880', permission: true}],
  options: [
    {
      name: 'emoji',
      description: 'Napiš jeden libovolný oficiální Discord emotikon',
      type: 'STRING',
      required: true
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {

    await interaction.deferReply({ ephemeral: true }).catch(() => {});

    let emoji = interaction.options.getString('emoji')
    

    try {
      if (!(/\p{Emoji}/u).test(emoji) || emoji.length > 4) {
        await interaction.editReply({embeds: [{title: "Neplatný emoji", description: `\`${emoji}\``, footer: {text: "Pouze oficiální Discord emojis jsou podporovány"}, color: "RED"}]})
        return
      }
      
      let db = await uhg.mongo.run.update("general", "verify", {_id:interaction.user.id}, {emoji: emoji})
      if (db.acknowledged) {
        let verify = await uhg.mongo.run.get("general", "verify", {_id:interaction.user.id})
        let guild = uhg.dc.client.guilds.cache.get("455751845319802880")
        let member =  await guild.members.fetch()
        member = member.filter(n => n.user.id == interaction.user.id)
        member.first().setNickname(`${verify[0].nickname} ${emoji}`)
        interaction.editReply({embeds: [{title: "Emoji bylo úspěšně nastaveno", description: `\`${emoji}\``, footer: {text: "Pouze oficiální Discord emojis jsou podporovány"}, color: "GREEN"}]})
        return
      }
    } catch (e) {
      if (uhg.dc.cache.embeds) interaction.editReply({ embeds: [uhg.dc.cache.embeds.error(e, 'emoji Slash Command')] })
      else console.log(String(e).bgRed + ' neni loaded')
      return "Chyba v emoji slash commandu!"
    }
  }
}

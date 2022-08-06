module.exports = {
  name: "Member",
  aliases: ["member", "guild", "g"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname, ["guild", "key", "mojang", "guild"])
      if (api instanceof Object == false) return message
      let guild = api.guild.all
      if (!api.guild.guild) return `**${api.username}** - Guild: Žádná`
      let joined;
      let grank;

      for (let i=0; i<guild.members.length; i++) {
        if (guild.members[i].uuid == api.uuid) {
          joined = guild.members[i].joined
          grank = guild.members[i].rank
        }
      }
      let timein = Math.floor((new Date().getTime()-joined)/ 86400000)
      message = `**${grank} ${api.username}** - [${uhg.f(uhg.getGuildLevel(guild.exp))}] ${guild.name} - ${timein}d`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Member příkazu!"
    }
  }
}

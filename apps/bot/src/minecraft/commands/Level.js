module.exports = {
  name: "Level",
  aliases: ["lvl", "level"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let nwlevel = api.hypixel
      let message = `**${api.username}** - ${uhg.f(nwlevel.level)} Hypixel Network Level`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Level příkazu!"
    }
  }
}

module.exports = {
  name: "Level",
  aliases: ["lvl", "level"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let nwlevel = api.hypixel
      let message = `**${api.username}** - ${uhg.f(nwlevel.level)} Hypixel Network Level`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Level příkazu!"
    }
  }
}

module.exports = {
  name: "ThrowOut",
  aliases: ["throwout"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let throwout = api.hypixel.stats.arcade.throwout
      let message = `**ThrowOut**: **${api.username}** - ${throwout.wins}Wins ${throwout.kills}Kills ${throwout.kdr}KDR`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v ThrowOut příkazu!"
    }
  }
}

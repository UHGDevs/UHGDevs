module.exports = {
  name: "ThrowOut",
  aliases: ["throwout"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let throwout = api.hypixel.stats.arcade.throwout
      let message = `**ThrowOut**: **${api.username}** - ${throwout.wins}Wins ${throwout.kills}Kills ${throwout.kdr}KDR`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v ThrowOut příkazu!"
    }
  }
}

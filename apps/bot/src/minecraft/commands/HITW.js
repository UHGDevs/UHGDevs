module.exports = {
  name: "HITW",
  aliases: ["hitw", "holeinthewall"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let hitw = api.hypixel.stats.arcade.holeinthewall
      let message = `**HITW**: **${api.username}** - ${uhg.f(hitw.wins)}Wins ${hitw.rounds} Rounds, ${uhg.f(hitw.qscore)} Qualification Score, ${uhg.f(hitw.fscore)} Final Score`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v HITW příkazu!"
    }
  }
}

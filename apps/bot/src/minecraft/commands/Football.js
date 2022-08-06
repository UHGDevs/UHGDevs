module.exports = {
  name: "Football",
  aliases: ["football", "fb", "soccer"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let fb = api.hypixel.stats.arcade.football
      let message = `**Football**: **${api.username}** - ${uhg.f(fb.wins)}Wins ${uhg.f(fb.goals)} Goals`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Football příkazu!"
    }
  }
}

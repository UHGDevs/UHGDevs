module.exports = {
  name: "PartyGames",
  aliases: ["partygames", "pg"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let pg = api.hypixel.stats.arcade.partygames
      let message = `**PartyGames**: **${api.username}** - ${uhg.f(pg.wins)}Wins ${uhg.f(pg.stars)}☆ ${uhg.f(pg.rounds)} Rounds`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v PartyGames příkazu!"
    }
  }
}

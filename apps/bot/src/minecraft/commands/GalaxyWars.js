module.exports = {
  name: "GalaxyWars",
  aliases: ["galaxywars", "galaxy", "gw", "starwars"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let gwars = api.hypixel.stats.arcade.galaxywars
      let message = `**GalaxyWars**: **${api.username}** - ${uhg.f(gwars.wins)}Wins ${uhg.f(gwars.kills)}Kills ${uhg.f(gwars.kdr)}KDR`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v GalaxyWars příkazu!"
    }
  }
}

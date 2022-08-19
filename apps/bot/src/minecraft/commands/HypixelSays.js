module.exports = {
  name: "HypixelSays",
  aliases: ["hypixelsays", "simonsays", "santasays", "simon"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let simon = api.hypixel.stats.arcade.hypixelsays.overall
      let message = `**HypixelSays**: **${api.username}** - ${uhg.f(simon.wins)}Wins ${uhg.f(simon.totalpoints)} Points`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v HypixelSays příkazu!"
    }
  }
}

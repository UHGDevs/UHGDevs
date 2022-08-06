module.exports = {
  name: "MiniWalls",
  aliases: ["miniwalls", "miniw"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let miniwalls = api.hypixel.stats.arcade.miniwalls
      let message = `**MiniWalls**: **${api.username}** - ${uhg.f(miniwalls.wins)}Wins ${uhg.f(miniwalls.kills)}Kills ${uhg.f(miniwalls.kdr)}KDR (Withers: ${uhg.f(miniwalls.witherkills)}Kills ${uhg.f(miniwalls.witherdmg)} Dmg) Kit: ${uhg.capitalize(miniwalls.kit)}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v MiniWalls příkazu!"
    }
  }
}

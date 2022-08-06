module.exports = {
  name: "Pit",
  aliases: ["thepit", "pit", "hypixelpit"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let pit = api.hypixel.stats.pit
      let message = `**Pit**: [${pit.prestigeroman}-${pit.level}] **${api.username}** - Playtime: ${uhg.f(pit.playtime)} - ${uhg.f(pit.gold).split(".")[0]}g - ${uhg.f(pit.renown)} Renown`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Pit příkazu!"
    }
  }
}

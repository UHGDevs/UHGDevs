module.exports = {
  name: "Renown",
  aliases: ["renown", "renowns"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let pit = api.hypixel.stats.pit
      let message = `**Pit**: [${pit.prestigeroman}-${pit.level}] **${api.username}** - ${uhg.f(pit.renown)} Current Renown, ${uhg.f(pit.totalrenown)} Total Renown`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Renown příkazu!"
    }
  }
}

module.exports = {
  name: "TheWalls",
  aliases: ["thewalls", "walls"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let walls = api.hypixel.stats.walls
      let message = `**TheWalls**: [${walls.wins}] **${api.username}** - ${walls.kills}Kills ${walls.kdr}KDR ${walls.wlr}WLR`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v TheWalls příkazu!"
    }
  }
}

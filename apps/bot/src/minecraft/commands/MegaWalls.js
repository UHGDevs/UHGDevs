module.exports = {
    name: "MegaWalls",
    aliases: ["megawalls", "megaw", "mw"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let megawalls = api.hypixel.stats.megawalls
        let message = `**MegaWalls**: **${api.username}** - ${uhg.f(megawalls.wins)}Wins ${uhg.f(megawalls.kills)}Kills ${uhg.f(megawalls.fk)}FK ${uhg.f(megawalls.fkdr)}FKDR ${uhg.f(megawalls.wlr)}WLR | Playtime: ${Math.floor(uhg.toTime(megawalls.playtime).m)}h | Class: ${megawalls.class}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v MegaWalls příkazu!"
      }
    }
  }
  
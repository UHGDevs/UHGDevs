module.exports = {
  name: "Quake",
  aliases: ["quakecraft", "quake", "qc"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let quake = api.hypixel.stats.quake
      let message = `**Quake**: [${uhg.r(quake.kills)}] **${api.username}** - ${uhg.f(quake.wins)}Wins ${quake.kdr}KDR`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Quake příkazu!"
    }
  }
}

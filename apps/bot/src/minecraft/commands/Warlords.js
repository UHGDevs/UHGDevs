module.exports = {
    name: "Warlords",
    aliases: ["warlords", "warlord"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let w = api.hypixel.stats.warlords
        let message = `**Warlords**: ${api.username} - ${uhg.f(w.wins)}Wins ${uhg.f(w.kills)}Kills ${uhg.f(w.kdr)}KDR ${uhg.f(w.assists)}Assists`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Warlords příkazu!"
      }
    }
  }
  
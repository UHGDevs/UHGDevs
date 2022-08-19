module.exports = {
    name: "UHC",
    aliases: ["uhc", "ultrahardcore", "hypixeluhc", "hypixelultrahardcore"],
    run: async (uhg, pmsg) => {
      const f = uhg.f
      try{
        let nickname = pmsg.nickname
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let uhc = api.hypixel.stats.uhc
        let message = `**UHC**: [${uhc.level}✫] ${api.username} - ${f(uhc.wins)}Wins ${f(uhc.kills)}Kills ${f(uhc.kdr)}KDR (${f(uhc.score)} Score)`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v UHC příkazu!"
      }
    }
  }
  
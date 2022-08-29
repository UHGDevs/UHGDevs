module.exports = {
    name: "Blitz",
    aliases: ["blitz", "blitzsg", "sg", "bsg", "blitzsurvivalgames", "blits"],
    run: async (uhg, pmsg) => {
      try{
        let nickname = pmsg.nickname
        let api = await uhg.api.call(nickname)
        if (!api.success) return api.reason
        let sg = api.hypixel.stats.blitz
        let message = `**Blitz**: [${uhg.f(sg.kills)}] **${api.username}** - ${uhg.f(sg.wins)}Wins ${uhg.f(sg.wlr)}WLR ${uhg.f(sg.kdr)}KDR | Playtime: ${Math.floor(sg.playtime/60/60)}h | Default Kit: ${sg.defaultkit}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Blitz příkazu!"
      }
    }
  }
  
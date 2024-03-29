module.exports = {
    name: "PixelParty",
    aliases: ["pixelparty", "pp", "pixel"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let pp = api.hypixel.stats.arcade.pixelparty
        let message = `**PixelParty**: **${api.username}** - ${uhg.f(pp.wins || 0)}Wins ${uhg.f(pp.wlr || 0)}WLR | ${uhg.f(pp.rounds || 0)} Rounds (Highest ${pp.highestround || 0}) | ${uhg.f(pp.powerups || 0)} Powerups`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v PixelParty příkazu!"
      }
    }
  }
  
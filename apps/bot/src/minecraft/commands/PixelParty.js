module.exports = {
    name: "PixelParty",
    aliases: ["pixelparty", "pp", "pixel"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let pp = api.hypixel.stats.arcade.pixelparty
        let message = `**PixelParty**: **${api.username}** - ${uhg.f(pp.wins)}Wins ${uhg.f(pp.wlr)}WLR | ${uhg.f(pp.rounds)} Rounds (Highest ${pp.highestround}) | ${uhg.f(pp.powerups)} Powerups`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v PixelParty příkazu!"
      }
    }
  }
  
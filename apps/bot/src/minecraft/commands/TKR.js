module.exports = {
  name: "TKR",
  aliases: ["tkr", "turbokartracers"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let tkr = api.hypixel.stats.tkr
      let message = `**TKR**: [${uhg.f(tkr.gold)}✪] **${api.username}** - ${uhg.f(tkr.trophies)} Trophies (Gold - ${uhg.f(tkr.gold)}, Silver - ${uhg.f(tkr.silver)}, Bronze - ${uhg.f(tkr.bronze)}) ${uhg.f(tkr.wlr)}WLR ${uhg.f(tkr.trophyratio)} Trophy Ratio (Best Rt: ${uhg.f(tkr.highestrt)}, Best Pos: #${tkr.highestpos})`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v TKR příkazu!"
    }
  }
}

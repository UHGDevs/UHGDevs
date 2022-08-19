module.exports = {
  name: "WoolWars",
  aliases: ["ww", "wool", "wools", "woolwars"],
  run: async (uhg, pmsg) => {
    const f = uhg.f
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let ww = api.hypixel.stats.ww
      let message = `**WoolWars**: [${Math.floor(ww.levelformatted)}✫] ${api.username} - ${f(ww.wins)}Wins ${f(ww.kills)}Kills ${f(ww.wlr)}WLR ${f(ww.kdr)}KDR (${f(Math.round(ww.levelxpleft))} XP do dalšího levelu) | (Most played class based on kills: ${ww.main_class[0]})`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v WoolWars příkazu!"
    }
  }
}

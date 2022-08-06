module.exports = {
  name: "RSW",
  aliases: ["rankedskywars", "rsw", "rankedsw"],
  run: async (uhg, pmsg) => {
    try{
      let message;
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname, ["skywars", "mojang", "hypixel"])
      if (api instanceof Object == false) return api
      let rsw = api.rsw
      let skywars = api.hypixel.stats.skywars
      let ranked = skywars.ranked
      let highestrt = ranked.highestrt
      let highestpos = ranked.highestpos
      if (rsw.rating > 0) message = `**RSW**: [${skywars.levelformatted}] **${api.username}** - ${uhg.f(rsw.rating)} #${uhg.f(rsw.position)} (${rsw.div}) - Best Position: #${uhg.f(highestpos)}, Best Rating: ${uhg.f(highestrt)}`
      else message = `${api.username} tuto sezónu nehrál rsw - Best Pos: #${highestpos}, Best Rt: ${highestrt}`

      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v RSW příkazu!"
    }
  }
}

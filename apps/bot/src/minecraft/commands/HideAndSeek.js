module.exports = {
  name: "HideAndSeek",
  aliases: ["hideandseek", "has", "hns", "hidenseek", "prophunt", "partypopper"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let hns = api.hypixel.stats.arcade.hideandseek
      let overall = hns.overall
      let pp = hns.partypopper
      let ph = hns.prophunt
      message = `**HideAndSeek**: **${api.username}** - ${uhg.f(overall.wins)}Wins (Party Pooper: ${uhg.f(pp.hiderwins)}H ${uhg.f(pp.seekerwins)}S, Prop Hunt: ${uhg.f(ph.hiderwins)}H ${uhg.f(ph.seekerwins)}S)`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v HideAndSeek příkazu!"
    }
  }
}

module.exports = {
  name: "EnderSpleef",
  aliases: ["enderspleef", "ender", "es"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let ender = api.hypixel.stats.arcade.enderspleef
      let message = `**EnderSpleef**: **${api.username}** - ${uhg.f(ender.wins)}Wins - Trail: ${ender.trail}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v EnderSpleef příkazu!"
    }
  }
}

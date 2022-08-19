module.exports = {
  name: "EnderSpleef",
  aliases: ["enderspleef", "ender", "es"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let ender = api.hypixel.stats.arcade.enderspleef
      let message = `**EnderSpleef**: **${api.username}** - ${uhg.f(ender.wins)}Wins - Trail: ${ender.trail}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v EnderSpleef příkazu!"
    }
  }
}

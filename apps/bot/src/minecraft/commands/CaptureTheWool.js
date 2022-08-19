module.exports = {
  name: "CaptureTheWool",
  aliases: ["capturethewool", "ctw"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let ctw = api.hypixel.stats.arcade.capturethewool
      let message = `**CTW**: **${api.username}** - ${uhg.f(ctw.killsassists)}Kills+Assists ${uhg.f(ctw.capturedwools)} Captured Wools`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v CaptureTheWool příkazu!"
    }
  }
}

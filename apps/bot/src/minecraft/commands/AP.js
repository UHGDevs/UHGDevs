module.exports = {
  name: "AP",
  aliases: ["ap", "aps", "achievements", "achievement", "achievementpoints", "achievementpoint"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname, ['hypixel'])
      if (!api.success) return api.reason
      let ap = api.hypixel
      let message = `**${api.username}** - ${uhg.f(ap.aps)} Achievement Points (${uhg.f(ap.aps + ap.legacyAps)} with Legacy)`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v AP příkazu!"
    }
  }
}

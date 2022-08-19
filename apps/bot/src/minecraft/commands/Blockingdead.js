module.exports = {
  name: "Blockingdead",
  aliases: ["blockingdead", "bd"],
  run: async (uhg, pmsg) => {
    try {
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let blockingdead = api.hypixel.stats.arcade.blockingdead
      let message = `**BlockingDead**: **${api.username}** - ${uhg.f(blockingdead.wins)}Wins ${uhg.f(blockingdead.kills)}Kills ${uhg.f(blockingdead.headshots)}Headshots`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Blockingdead příkazu!"
    }
  }
}

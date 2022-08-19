module.exports = {
  name: "CreeperAttack",
  aliases: ["creeperattack", "creeper"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let creeper = api.hypixel.stats.arcade.creeperattack
      let message = `**CreeperAttack**: **${api.username}** - Best Round: ${creeper.bestround}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v CreeperAttack příkazu!"
    }
  }
}

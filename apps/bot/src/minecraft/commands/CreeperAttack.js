module.exports = {
  name: "CreeperAttack",
  aliases: ["creeperattack", "creeper"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let creeper = api.hypixel.stats.arcade.creeperattack
      let message = `**CreeperAttack**: **${api.username}** - Best Round: ${creeper.bestround}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v CreeperAttack příkazu!"
    }
  }
}

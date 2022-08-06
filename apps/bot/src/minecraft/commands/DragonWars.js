module.exports = {
  name: "DragonWars",
  aliases: ["dragonwars", "dw", "dragons", "dragon"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let dw = api.hypixel.stats.arcade.dragonwars
      let message = `**DragonWars**: **${api.username}** - ${uhg.f(dw.wins)}Wins ${uhg.f(dw.kills)}Kills`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v DragonWars příkazu!"
    }
  }
}

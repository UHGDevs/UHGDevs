module.exports = {
  name: "FarmHunt",
  aliases: ["farmhunt", "farm", "fh"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname)
      if (api instanceof Object == false) return api
      let farm = api.hypixel.stats.arcade.farmhunt
      let message = `**FarmHunt**: **${api.username}** - ${uhg.f(farm.wins)}Wins (${uhg.f(farm.animalwins)}A ${uhg.f(farm.hunterwins)}H), ${uhg.f(farm.kills)}Kills (${uhg.f(farm.animalkills)}A ${uhg.f(farm.hunterkills)}H)`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v FarmHunt příkazu!"
    }
  }
}

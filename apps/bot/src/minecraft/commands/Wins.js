module.exports = {
  name: "Wins",
  aliases: ["wins", "win", "výhry"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname, ["api", "skyblock", "hypixel", "mojang"])
      if (api instanceof Object == false) return api
      let wins = api.hypixel.stats.wins
      const keys = Object.keys(wins.minigames)
      const values = keys.map(key => {
        return wins.minigames[key]
      });
      const maxValue = Math.max.apply(null, values)
      let final = {};
      for (let i in wins.minigames) {
        if (wins.minigames[i] == maxValue) {
          final = {minigame: i, wins: maxValue}
          delete wins.minigames[i]
        }
      }
      const keys2 = Object.keys(wins.minigames)
      const values2 = keys2.map(key => {
        return wins.minigames[key]
      });
      const maxValue2 = Math.max.apply(null, values2)
      let final2 = {};
      for (let i in wins.minigames) {
        if (wins.minigames[i] == maxValue2) {
          final2 = {minigame: i, wins: maxValue2}
          delete wins.minigames[i]
        }
      }
      const keys3 = Object.keys(wins.minigames)
      const values3 = keys3.map(key => {
        return wins.minigames[key]
      });
      const maxValue3 = Math.max.apply(null, values3)
      let final3 = {};
      for (let i in wins.minigames) {
        if (wins.minigames[i] == maxValue3) final3 = {minigame: i, wins: maxValue3}
      }
      
      let message = `**${api.username}** - ${uhg.f(wins.total)} Wins (1st: ${final.minigame} - ${uhg.f(final.wins)}; 2nd: ${final2.minigame} - ${uhg.f(final2.wins)}; 3rd: ${final3.minigame} - ${uhg.f(final3.wins)})`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Wins příkazu!"
    }
  }
}

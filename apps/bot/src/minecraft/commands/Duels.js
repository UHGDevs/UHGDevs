module.exports = {
    name: "Duels",
    aliases: ["duels", "duel"],
    run: async (uhg, pmsg) => {
      const f = uhg.f
      try{
        let nickname = pmsg.nickname
        let api = await uhg.getApi(nickname)
        if (api instanceof Object == false) return api
        let duels = api.hypixel.stats.duels
        let message = `**Duels**: **${api.username}** - ${f(duels.wins)}Wins ${f(duels.wlr)}WLR - ${f(duels.winstreak)} Winstreak (Best Winstreak: ${f(duels.bestwinstreak)})`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Duels příkazu!"
      }
    }
  }
  
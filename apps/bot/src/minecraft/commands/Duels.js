module.exports = {
    name: "Duels",
    aliases: ["duels", "duel"],
    run: async (uhg, pmsg) => {
      const f = uhg.f
      try{
        let nickname = pmsg.nickname
        let api = await uhg.api.call(nickname)
        if (!api.success) return api.reason
        let duels = api.hypixel.stats.duels

        let winstreak = duels.wins > 0 && duels.bestwinstreak == 0 ? "(Winstreak API OFF)" : `- ${f(duels.winstreak)} Winstreak (Best Winstreak: ${f(duels.bestwinstreak)})`

        let message = `**Duels**: **${api.username}** - ${f(duels.wins)}Wins ${f(duels.wlr)}WLR ${winstreak}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Duels příkazu!"
      }
    }
  }
  
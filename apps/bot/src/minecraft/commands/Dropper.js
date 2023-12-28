module.exports = {
    name: "Dropper",
    aliases: ["dropper"],
    run: async (uhg, pmsg) => {
      try{
        let nickname = pmsg.nickname
        let api = await uhg.api.call(nickname)
        if (!api.success) return api.reason
        let d = api.hypixel.stats.arcade.dropper
        let message = `**Dropper**: **${api.username}** - ${uhg.f(d.wins)} Wins | ${uhg.f(d.wlr)} WLR | ${uhg.f(d.games_finished)} Games Finished | Best Time ${uhg.toTime(d.fastest_game, true).s}s`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Dropper příkazu!"
      }
    }
  }
  
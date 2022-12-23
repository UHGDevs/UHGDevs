module.exports = {
    name: "Arcade",
    aliases: ["arcade", "arcades", "arcadegames", "arc"],
    run: async (uhg, pmsg) => {
      try{
        let nickname = pmsg.nickname
        let api = await uhg.api.call(nickname)
        if (!api.success) return api.reason
        let arcade = api.hypixel.stats.arcade
        let message = `**Arcade**: **${api.username}** - ${uhg.f(arcade.wins)}Wins`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Arcade příkazu!"
      }
    }
  }
  
module.exports = {
    name: "TNTGames",
    aliases: ["tntgames", "tnt", "tnts", "tntgame", "wizard", "wizards", "tntwizard", "tntwizards", "tntrun", "pvprun", "tnttag", "bowspleef", "tntbowspleef", "tntspleef"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let tnt = api.hypixel.stats.tntgames
        let overall = tnt.overall
        let message = `**TNTGames**: **${api.username}** - ${uhg.f(overall.wins)}Wins ${uhg.f(overall.kills)}Kills ${uhg.f(overall.kdr)}KDR (Playtime: ${Math.floor(tnt.playtime)}h)`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v TNTGames příkazu!"
      }
    }
  }
  
module.exports = {
    name: "Gameplayers",
    aliases: ["gameplayers", "gamereq", "gr", "gamerequirement", "req", "requirement", "pr", "playerrequirement", "playerreq", "gp"],
    run: async (uhg, pmsg) => {
      try{
        let args = pmsg.args.split(' ')
        if (!args.length) return '!gameplayers on|off'
  
        if (args[0] == 'off') {
          uhg.mongo.run.update('general', 'uhg', { username: pmsg.username }, { gameplayers: {} })
          return 'Už nebudeš dostávat gameplayers upozornění'
        } else if (args[0] != 'on') return '!gameplayers on|off'
        if (args.length < 2 || !args[2]) return '!gameplayers on [game] [players req]'

        let game = uhg.getGameplayers(args[1])
        let req = args[2]
        let gamemode;

        const supportedGames = ["skywars_mega", "prototype_pixelparty", "mw", "warlords", "legacy_paintball", "legacy_quake", "legacy_arena", "legacy_tkr", "legacy_vampirez", "legacy_walls", "supersmash", "uhc", "speeduhc"]
        if (!supportedGames.includes(game)) return "Tato minihra není podporována, podporované minihry nalezneš v Command dokumentu napravo https://shorturl.at/ipDR8"

        if (!(req > 0)) return "Neplatný počet požadovaných hráčů"

        game = game.split("_")
        if (game.length > 1) {gamemode = game[1]; game = game[0]} 
  
        let api = await uhg.api.call(pmsg.username, ['hypixel', 'gamecounts'])
        if (!api.success) return api.reason
        if ((!api.gamecounts.games[game] ) || (gamemode && api.gamecounts.games[game][gamemode] < 0)) return "Tato minihra není podporována, podporované minihry nalezneš v Command dokumentu napravo https://shorturl.at/ipDR8"

        let message = `Zapínání gameplayers na ${gamemode ? `${game} ${gamemode}` : game}`
        uhg.mongo.run.update('general', 'uhg', { username: pmsg.username }, { gameplayers: {toggle: true, game: game, gamemode: gamemode, req: parseInt(req)} })
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Gameplayers příkazu!"
      }
    }
  }
  
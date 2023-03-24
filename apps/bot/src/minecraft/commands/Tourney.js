module.exports = {
    name: "Tourney",
    aliases: ["tourney", "tournament", "tour", "t"],
    run: async (uhg, pmsg) => {
      try{
        let nickname = pmsg.nickname
        let getmode = pmsg.args
        let args1;
        let args2;
        if (getmode) args1 = getmode.split(" ")[0]
        if (getmode) args2 = getmode.split(" ")[1]
        let mode;
        let gamealiases = ["bsg", "blitz", "sg", "blitzsg", "survivalgames", "blitzsurvivalgames"] //   UPDATOVAT
        let all = ["basic", "b", "normal", "overall", "základní", "game", "stats", "g"].concat(gamealiases)
        let game = ["game", "stats", "g"].concat(gamealiases);
        let basic = ["basic", "b", "normal", "overall", "základní"]
        for (let i in all) {
          if (args1 == all[i]) {nickname = args2 || pmsg.username; mode = args1}
          else if (args2 == all[i]) {nickname = args1 || pmsg.username; mode = args2}
          if (basic.includes(mode)) mode = "basic"
          else if (game.includes(mode)) mode = "game"
        }
        let api = await uhg.getApi(nickname)
        if (api instanceof Object == false) return api
        let tourney = api.hypixel.stats.tourney
        let currenttournament = tourney.currenttournament
        let ctfancy = "Blitz Duo" //   UPDATOVAT
        let ctourney = tourney[currenttournament]
        if (!currenttournament) return "Momentálně se neodehrává žádný turnaj"
  
        let message = `Použij příkaz takhle: "!tourney game" nebo "!tourney basic"`
        if (mode === "basic") message = `**${ctfancy} Tourney**: **${api.username}** - ${tourney.games}/${tourney.maxgames} Games - ${tourney.tributes}/100 Tributes (Total: ${tourney.totaltributes}) - ${tourney.playtime}min Playtime`
        else if (mode === "game") message  = `**${ctfancy} Tourney**: **${api.username}** - ${uhg.f(ctourney.wins)}Wins ${uhg.f(ctourney.wlr)}WLR ${uhg.f(ctourney.kills)}Kills ${uhg.f(ctourney.kdr)}KDR | Playtime: ${Math.floor(ctourney.playtime/60/60)}h | Most Played Kit: ${uhg.capitalize(ctourney.mostusedkit)}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Tourney příkazu!"
      }
    }
  }
  
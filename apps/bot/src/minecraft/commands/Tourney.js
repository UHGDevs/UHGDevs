module.exports = {
    name: "Tourney",
    aliases: ["tourney", "tournament", "tour"],
    run: async (uhg, pmsg) => {
      try{
        let nickname = pmsg.nickname
        let getmode = pmsg.args
        let args1;
        let args2;
        if (getmode) args1 = getmode.split(" ")[0]
        if (getmode) args2 = getmode.split(" ")[1]
        let mode;
        let all = ["basic", "b", "normal", "overall", "základní", "game", "stats", "g", "miniw", "miniwalls", "mw"]
        let game = ["game", "stats", "g", "miniw", "miniwalls", "mw"];
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
        let ctfancy = "Mini Walls" //   UPDATOVAT
        let ctourney = tourney[currenttournament]
        if (!currenttournament) return "Momentálně se neodehrává žádný turnaj"
  
        let message = `Použij příkaz takhle: "!tourney game" nebo "!tourney basic"`
        if (mode === "basic") message = `**${ctfancy} Tourney**: **${api.username}** - ${tourney.games}/${tourney.maxgames} Games - ${tourney.tributes}/100 Tributes (Total: ${tourney.totaltributes}) - ${tourney.playtime}min Playtime`
        else if (mode === "game") message  = `**${ctfancy} Tourney**: **${api.username}** - ${uhg.f(ctourney.wins)}Wins ${uhg.f(ctourney.kills)}Kills ${uhg.f(ctourney.kdr)}KDR (Withers: ${uhg.f(ctourney.witherkills)} Kills | ${uhg.f(ctourney.witherdmg)} Damage) Kit: ${uhg.capitalize(ctourney.kit)}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Tourney příkazu!"
      }
    }
  }
  
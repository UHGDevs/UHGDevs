module.exports = {
    name: "Fact",
    aliases: ["fact", "facts", "hypixelfact", "hypixelfacts", "funfact", "funfacts", "fakt", "fakty"],
    run: async (uhg, pmsg) => {
      try{
        let args;
        if (pmsg.args.length) args = pmsg.args.split(" ")

        let api = await uhg.getApi(pmsg.username, ["api", "skyblock", "hypixel", "mojang", "online", "gamecounts", "guild"])
        if (api instanceof Object == false) return api

        let fact2 = "Vypadá to, že momentálně hraješ.. vypadá to, že momentálně nic nehraješ :/"
        if (api.online.game && api.online.mode != "lobby") fact2 = `Vypadá to, že momentálneš hraješ ${api.online.game}`

        let fact9 = `SIMP CHECK >>>>> PROCESSING RESULTS -+-+- RESULTS: NEGATIVE`
        if (api.username == "zmikisek" || api.username == "0hBlood" || api.username == "unisdynasty") fact9 = `SIMP CHECK >>>>> PROCESSING RESULTS -+-+- RESULTS: POSITIVE`

        let facts = [
            `Fact #0 - Označili byste fakt č. 0 jako nultý fakt nebo první fakt?`,
            `Fact #1 - Vývojáři tohoto bota jsou DavidCzPdy a Farmans.. Můžete hádat, kdo z nich dělal tento zbytečný příkaz`,
            `Fact #2 - ${fact2}`,
            `Fact #3 - Momentálně se v Limbu nachází ${uhg.f((api.gamecounts.games.limbo || 0)+(api.gamecounts.games.idle || 0))} hráčů`,
            `Fact #4 - Momentálně na serveru hraje ${uhg.f(api.gamecounts.playerCount || 0)} hráčů`,
            `Fact #5 - Víte, že MVP++ má na lobby Speed II, ale ostatní ranky mají jen Speed I? P2W server, confirmed`,
            `Fact #6 - Momentálně na Hypixelu je přes 50 možných her, dokážeš je všechny vymasterovat?`,
            `Fact #7 - Víte, že na SkyBlocku existuje takový Cookie Clicker? Najdete ho v Booster Cookie menu`,
            `Fact #8 - Víte, že když si změníte jazyk na serveru, tak se vám změní nápisy psanými bloky? Například LEAD a INFO na různých lobby`,
            `Fact #9 - ${fact9}`,
            `Fact #10 - Jak mám ksakru testovat tento příkaz, když to trvá 5 let, než se dostanu na ten konkrétní fakt, který chci!!`,
            `Fact #11 - Momentálně ${uhg.f(api.gamecounts.games.skyblock.crimson_isle || 0)} hráčů hraje na Crimson Isle`,
            `Fact #12 - Momentálně ${uhg.f(api.gamecounts.games.skyblock.dungeons || 0)} hráčů throwuje v Dungeonech`,
            `Fact #13 - Tipněte si kolik lidí je momentálně v Crystal Hollows.... špatně, haha, je jich tam přesně ${uhg.f(api.gamecounts.games.skyblock.hollows || 0)}`,
            `Fact #14 - Ona existuje zkratka pro /g onlinemode a to je /g om.. Tohle jsem se dozvěděl OMYLEM po 3 rocích v guild brandžích, to má být vtip?`,
            `Fact #15 - Čím vyšší úroveň barvy pluska máte u MVP, tak zřejmě víte, že jste nejvíc nahoře v TABu, ale tohle platí i na SkyBlocku, kde to není zas tak jasné pro některé.`,
            `Fact #16 - Víte, že UHG byla založena dvakrát? Poprvé vydržela necelý den, když uni odešel do TKJK a napodruhé je ta, jak ji již známe dnes`
        ];
        let message;
        if (args && parseInt(args[0]) != NaN && facts.length > parseInt(args[0])) {// pokud si uživatel vybral konkrétní fakt
          if (parseInt(args[0]) < 0) message = "Fact #??? - To má být pokus o vtip? Celkem neúspěšný" // pokud je číslo negativní
          else message = facts[parseInt(args[0])]
        }
        else {
          let randomNumber = Math.random() 
          let index = Math.floor(randomNumber*facts.length)
          message = facts[index]
        }
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v fact příkazu!"
      }
    }
  }
  
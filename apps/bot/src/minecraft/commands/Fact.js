module.exports = {
    name: "Fact",
    aliases: ["fact", "facts", "hypixelfact", "hypixelfacts", "funfact", "funfacts", "fakt", "fakty"],
    run: async (uhg, pmsg) => {
      try{
        let args;
        if (pmsg.args.length) args = pmsg.args.split(" ")

        async function fact(uhg, pmsg, fact) {
          let api;
          switch (fact) {
            case "2":
              api = await uhg.getApi(pmsg.username, ["mojang", "online"])
              if (api instanceof Object == false) return api
              return api.online.game && api.online.mode != "lobby" ? `Vypadá to, že momentálneš hraješ ${api.online.game}` : "Vypadá to, že momentálně hraješ.. vypadá to, že momentálně nic nehraješ :/"
            case "3":
              api = await uhg.getApi("1afa0f55eb264065846b912c3397ab78", ["gamecounts"])
              if (api instanceof Object == false) return api
              return `Momentálně se v Limbu nachází ${uhg.f((api.gamecounts.games.limbo || 0)+(api.gamecounts.games.idle || 0))} hráčů`
            case "4":
              api = await uhg.getApi("1afa0f55eb264065846b912c3397ab78", ["gamecounts"])
              if (api instanceof Object == false) return api
              return `Momentálně na serveru hraje ${uhg.f(api.gamecounts.playerCount || 0)} hráčů`
            case "9":
              return ["zmikisek", "unisdynasty", "honzu", "0hblood"].includes(pmsg.username.toLowerCase()) ? "SIMP CHECK >>>>> PROCESSING RESULTS -+-+- RESULTS: POSITIVE" : "SIMP CHECK >>>>> PROCESSING RESULTS -+-+- RESULTS: NEGATIVE"
            case "10":
              api = await uhg.getApi("1afa0f55eb264065846b912c3397ab78", ["gamecounts"])
              if (api instanceof Object == false) return api
              return `Momentálně ${uhg.f(api.gamecounts.games.skyblock.crimson_isle || 0)} hráčů hraje na Crimson Isle`
            case "11":
              api = await uhg.getApi("1afa0f55eb264065846b912c3397ab78", ["gamecounts"])
              if (api instanceof Object == false) return api
              return `Momentálně ${uhg.f(api.gamecounts.games.skyblock.dungeons || 0)} hráčů throwuje v Dungeonech`
            case "12":
              api = await uhg.getApi("1afa0f55eb264065846b912c3397ab78", ["gamecounts"])
              if (api instanceof Object == false) return api
              return `Tipněte si kolik lidí je momentálně v Crystal Hollows.... špatně, haha, je jich tam přesně ${uhg.f(api.gamecounts.games.skyblock.hollows || 0)}`
            default:
              return fact
          }
        }

        let facts = [
            `Označili byste fakt č. 0 jako nultý fakt nebo první fakt?`,
            `Vývojáři tohoto bota jsou DavidCzPdy a Farmans.. Můžete hádat, kdo z nich dělal tento zbytečný příkaz`,
            `2`,
            `3`,
            `4`,
            `Víte, že MVP++ má na lobby Speed II, ale ostatní ranky mají jen Speed I? P2W server, confirmed`,
            `Momentálně na Hypixelu je přes 50 možných her, dokážeš je všechny vymasterovat?`,
            `Víte, že na SkyBlocku existuje takový Cookie Clicker? Najdete ho v Booster Cookie menu`,
            `Víte, že když si změníte jazyk na serveru, tak se vám změní nápisy psanými bloky? Například LEAD a INFO na různých lobby`,
            `9`,
            `10`,
            `11`,
            `12`,
            `Ona existuje zkratka pro /g onlinemode, a to je /g om.. Tohle jsem se dozvěděl OMYLEM po 3 rocích v guild brandžích, to má být vtip?`,
            `Víte, že UHG byla založena dvakrát? Poprvé vydržela necelý den, když uni odešel do TKJK a napodruhé je ta, jak ji již známe dnes`,
            `Zkus napsat paragraf do chatu, haha nejde to co?`
        ];
        let message;
        if (args && parseInt(args[0]) && facts.length > parseInt(args[0])) {// pokud si uživatel vybral konkrétní fakt
          if (parseInt(args[0]) < 0) message = "Fact #??? - To má být pokus o vtip? Celkem neúspěšný" // pokud je číslo negativní
          else message = `Fact #${args[0]} - ${await fact(uhg, pmsg, facts[parseInt(args[0])])}`
        }
        else {
          let randomNumber = Math.random() 
          let index = Math.floor(randomNumber*facts.length)
          message = `Fact #${index} - ${await fact(uhg, pmsg, facts[index])}`
        }
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v fact příkazu!"
      }
    }
  }
  
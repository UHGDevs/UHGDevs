module.exports = {
    name: "CrimsonQuests",
    aliases: ["crimsonquests", "quests", "quest", "crimsonquest", "dailyquest", "dailyquests", "crimonsislequest", "crimsonislequests", "islequest", "islequests", "netherquests", "netherquest", "netherdailyquests"],
    run: async (uhg, pmsg) => {
      try {
        return "Hypixel tuto funkci odstranil z Public API, příkaz a funkci zde nechávám pro případ, že Hypixel přidá údaje zpět do Public API a jedná se pouze o dočasný případ"
        let nickname = pmsg.nickname
        let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["nether"])
        if (api instanceof Object == false) return api
        let nether = api.skyblock.nether
        let profile;
        let rep = 0;
        let quests = [];
        for (let i=0; i<Object.keys(nether).length; i++) {
          if (Object.values(nether)[i].rep >= rep) {
            profile = Object.keys(nether)[i]
            quests = Object.values(nether)[i].quests
          }
        }
        let profil = nether[profile]
        let final = "";
        for (let i in quests) {
            final += `${quests[i]} | `
        }
        let message = `**${api.username}** - ${final.substring(0, final.length - 2)}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v CrimsonQuests příkazu!"
      }
    }
  }
  
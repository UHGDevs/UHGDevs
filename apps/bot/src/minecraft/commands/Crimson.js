module.exports = {
    name: "Crimson",
    aliases: ["crimson", "nether", "dojo", "kuudra", "kuudras", "faction", "trophies", "trophyfish", "trophyfishing", "rep", "reputation", "crimsonrep", "netherrep", "crimsonisle"],
    type: 'skyblock',
    run: async (uhg, pmsg) => {
      try {
        let nickname = pmsg.nickname
        let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["nether"])
        if (api instanceof Object == false) return api
        let nether = api.skyblock.nether
        let profile;
        let rep = 0;
        let trophies = 0;
        let kuudras = 0;
        let dojo = 0;
        let faction;
        for (let i=0; i<Object.keys(nether).length; i++) {
          if (Object.values(nether)[i].rep >= rep) {
            profile = Object.keys(nether)[i]
            rep = Object.values(nether)[i].rep
            trophies = Object.values(nether)[i].trophies
            kuudras = Object.values(nether)[i].kuudras
            dojo = Object.values(nether)[i].dojo
            faction = Object.values(nether)[i].faction
          }
        }

        let message = `**Crimson**: **${api.username}** - ${uhg.f(rep)} Rep | ${uhg.f(kuudras)} Kuudras killed | ${uhg.f(dojo)} Dojo Pts | ${uhg.f(trophies)} Trophy Fish | ${uhg.capitalize(faction)} Faction`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Crimson příkazu!"
      }
    }
  }
  
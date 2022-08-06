module.exports = {
  name: "Mining",
  aliases: ["mining", "powder", "gemstone", "mithril", "gemstonepowder", "mithrilpowder", "hotm", "heartofthemountain", "nucleus", "crystalnucleus", "scatha", "scathakills", "comms", "commissions", "nucleusruns"],
  run: async (uhg, pmsg) => {
    try {
      const f = uhg.f
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["mining"])
      if (api instanceof Object == false) return api
      let mining = api.skyblock.mining
      let profile;
      let powdersum = 0;
      let mithril = 0;
      let gemstone = 0;
      let hotmtier = 0;
      let nucleus = 0;
      let comms = 0;
      let scatha = 0;
      for (let i=0; i<Object.keys(mining).length; i++) {
        if (Object.values(mining)[i].powdersum >= powdersum) {
          profile = Object.keys(mining)[i]
          powdersum = Object.values(mining)[i].powdersum
          mithril = Object.values(mining)[i].mithril
          gemstone = Object.values(mining)[i].gemstone
          hotmtier = Object.values(mining)[i].hotmtier
          nucleus = Object.values(mining)[i].nucleus
          comms = Object.values(mining)[i].comms
          scatha = Object.values(mining)[i].scatha
        }
      }

      let nucleusnoun = "s"
      if (nucleus == 1) nucleusnoun = ""
      let commnoun = "s"
      if (comms == 1) commnoun = ""
      let scathanoun = "s"
      if (scatha == 1) scathanoun = ""

      let profil = mining[profile]
      let message = `Mining: **${api.username}** - HOTM Tier ${hotmtier} | ${f(nucleus)} Nucleus Run${nucleusnoun} | ${f(scatha)} Scatha Kill${scathanoun} | ${f(comms)} Comission${commnoun} | ${f(mithril)} Mithril Powder | ${f(gemstone)} Gemstone Powder`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Mining příkazu!"
    }
  }
}

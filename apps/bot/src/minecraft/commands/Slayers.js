module.exports = {
  name: "Slayers",
  aliases: ["slayers", "slayer"],
  run: async (uhg, pmsg) => {
    try {
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["slayers"])
      if (api instanceof Object == false) return api
      let slayers = api.skyblock.slayers
      let profile;
      let overallxp = 0;
      for (let i=0; i<Object.keys(slayers).length; i++) {
        if (Object.values(slayers)[i].overallxp >= overallxp) {
          profile = Object.keys(slayers)[i]
          overallxp = Object.values(slayers)[i].overallxp
        }
      }
      if (!profile) return `**${api.username}** nehrál slayery`
      let profil = slayers[profile]
      let zombielvl = profil.zombielvl || 0
      let spiderlvl = profil.spiderlvl || 0
      let wolflvl = profil.wolflvl || 0
      let emanlvl = profil.emanlvl || 0
      let blazelvl = profil.blazelvl || 0
      let zombiexp = profil.zombiexp || 0
      let spiderxp = profil.spiderxp || 0
      let wolfxp = profil.wolfxp || 0
      let emanxp = profil.emanxp || 0
      let blazexp = profil.blazexp || 0
      let message = `Slayers: [${uhg.f(overallxp)}] **${api.username}** - Rev ${Math.floor(zombielvl)} (${uhg.f(zombiexp)}); Tara ${Math.floor(spiderlvl)} (${uhg.f(spiderxp)}); Sven ${Math.floor(wolflvl)} (${uhg.f(wolfxp)}); Voidgloom ${Math.floor(emanlvl)} (${uhg.f(emanxp)}); Inferno ${Math.floor(blazelvl)} (${uhg.f(blazexp)})`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Slayers příkazu!"
    }
  }
}

module.exports = {
  name: "Skills",
  aliases: ["skills", "skill", "skilly"],
  run: async (uhg, pmsg) => {
    try {
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["skills"])
      if (api instanceof Object == false) return api
      let skills = api.skyblock.skills
      let profile;
      let overallxp = 0;
      for (let i=0; i<Object.keys(skills).length; i++) {
        if (Object.values(skills)[i].overallxp >= overallxp) {
          profile = Object.keys(skills)[i]
          overallxp = Object.values(skills)[i].overallxp
        }
      }
      if (!profile) return `**${api.username}** nemá skilly`
      let profil = skills[profile]
      let skillavg = profil.skillavg || 0
      let taming = profil.taming || 0
      let mining = profil.mining || 0
      let foraging = profil.foraging || 0
      let enchanting = profil.enchanting || 0
      let carpentry = profil.carpentry || 0
      let farming = profil.farming || 0
      let combat = profil.combat || 0
      let fishing = profil.fishing || 0
      let alchemy = profil.alchemy || 0
      let runecrafting = profil.runecrafting || 0
      let social = profil.social || 0
      let apioff = "";
      if (profil.apioff == true) apioff = "(API OFF)"

      let message = `Skills: [${uhg.f(skillavg)} SA] **${api.username}** - Tam ${taming}, Mine ${mining}, Forag ${foraging}, Ench ${enchanting}, Carp ${carpentry}, Farm ${farming}, Combat ${combat}, Fish ${fishing}, Alch ${alchemy}, Rune ${runecrafting}, Social ${social} ${apioff}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Skills příkazu!"
    }
  }
}

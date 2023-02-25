module.exports = {
  name: "Cata",
  aliases: ["cata", "catacombs"],
  type: 'skyblock',
  run: async (uhg, pmsg) => {
    try {
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["dungeons"])
      if (api instanceof Object == false) return api
      let dungeons = api.skyblock.dungeons
      let profile;
      let level = 0;
      for (let i=0; i<Object.keys(dungeons).length; i++) {
        if (Object.values(dungeons)[i].level >= level) {
          profile = Object.keys(dungeons)[i]
          level = Object.values(dungeons)[i].level
        }
      }
      if (!profile) return `**${api.username}** nehrál dungeony`
      let profil = dungeons[profile]
      let catalevel = profil.level || 0
      let secrets = profil.secrets || 0
      let secretsratio = profil.secretsratio || 0
      let clas = profil.class || "Class None"
      let message = `Cata: [${catalevel}] **${api.username}** - ${uhg.f(secrets)} Secrets | ${uhg.f(secretsratio)} Secrets/Run | ${uhg.f(profil.bloodmobkills || 0)} Blood Kills | ${uhg.capitalize(clas)}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Catacombs příkazu!"
    }
  }
}

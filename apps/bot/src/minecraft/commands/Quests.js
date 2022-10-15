module.exports = {
    name: "Quests",
    aliases: ["quests", "quest", "challenge", "challenges", "vyzvy", "výzvy", "úkoly", "ukoly", "ukol", "vyzva", "úkol", "výzva"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname, ['hypixel'], {verify: pmsg.verify_data})
        if (!api.success) return api.reason
        let qch = api.hypixel
        let message = `**${api.username}** - ${uhg.f(qch.quests)} Quests - ${uhg.f(qch.challenges)} Challenges`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Quests příkazu!"
      }
    }
  }
  
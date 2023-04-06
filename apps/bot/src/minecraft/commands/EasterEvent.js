module.exports = {
    name: "EasterEvent",
    aliases: ["easter"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let message = `**EasterEvent**: **${api.username}** - Level ${Math.floor(api.hypixel.seasonal.easter["2023"].level || 0)} | ${uhg.f(api.hypixel.seasonal.easter["2023"].xpleft || 0)} XP do dalšího Levelu | ${uhg.f(api.hypixel.seasonal.silver || 0)} Silver`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v EasterEvent příkazu!"
      }
    }
  }
  
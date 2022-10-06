module.exports = {
    name: "HalloweenEvent",
    aliases: ["halloween", "halloween"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let message = `**HalloweenEvent**: **${api.username}** - Level ${Math.floor(api.hypixel.seasonal.halloween["2022"].level || 0)} | ${uhg.f(api.hypixel.seasonal.halloween["2022"].xpleft || 0)} XP do dalšího Levelu | ${uhg.f(api.hypixel.seasonal.silver || 0)} Silver`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v HalloweenEvent příkazu!"
      }
    }
  }
  
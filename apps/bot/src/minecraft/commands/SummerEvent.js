module.exports = {
    name: "SummerEvent",
    aliases: ["summer", "summerevent", "event"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.getApi(pmsg.nickname)
        if (api instanceof Object == false) return api
        let message = `**SummerEvent**: **${api.username}** - Level ${Math.floor(api.hypixel.seasonal.summer.level || 0)} | ${uhg.f(api.hypixel.seasonal.summer.xpleft || 0)} XP do dalšího Levelu | ${uhg.f(api.hypixel.seasonal.silver || 0)} Silver`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v SummerEvent příkazu!"
      }
    }
  }
  
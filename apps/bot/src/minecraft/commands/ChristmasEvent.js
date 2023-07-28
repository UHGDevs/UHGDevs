module.exports = {
    name: "ChristmasEvent",
    aliases: ["christmas", "christmasevent", "xmas", "xmasevent"],
    run: async (uhg, pmsg) => {
      try{
        let args = pmsg.args.split(" ")
        let year = JSON.stringify(new Date().getFullYear())
        let nickname = pmsg.username
        if (args.length && args[0].length == 4 && !isNaN(args[0])) {
          year = args[0]
          nickname = args[1] || pmsg.username
        } else if (args[0] != ""/*defaultně je args split [ "" ], idk proč*/) {
          year = args[1] || JSON.stringify(new Date().getFullYear())
          nickname = args[0]
        }
        let api = await uhg.api.call(nickname)
        if (!api.success) return api.reason
        if (!Object.keys(api.hypixel.seasonal.events.christmas).includes(year)) return `Hráč nehrál v roce ${year} Christmas event`
        let message = `**${year} ChristmasEvent**: **${api.username}** - Level ${Math.floor(api.hypixel.seasonal.events.christmas[year].level || 0)} | ${uhg.f(api.hypixel.seasonal.events.christmas[year].xpleft || 0)} XP do dalšího Levelu | ${uhg.f(api.hypixel.seasonal.silver || 0)} Silver`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v ChristmasEvent příkazu!"
      }
    }
  }
  
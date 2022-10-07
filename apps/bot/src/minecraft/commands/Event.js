module.exports = {
    name: "SeasonalEvents",
    aliases: ["seasonalevent", "seasonal", "events", "event", "seasonalevents"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let events = Object.keys(api.hypixel.seasonal)
        events.splice(events.indexOf("silver"))
        let message = `Na seasonal event statistiky se můžeš podívat skrz: !${events.join(" !")}`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v HalloweenEvent příkazu!"
      }
    }
  }
  
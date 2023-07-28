module.exports = {
    name: "SeasonalEvents",
    aliases: ["seasonalevent", "seasonal", "events", "event", "seasonalevents"],
    run: async (uhg, pmsg) => {
      try{
        let events = ["christmas", "easter", "summer", "halloween"]
        let message = `Na seasonal event statistiky se můžeš podívat skrz: !${events.join(" !")} (lze uvést i rok)`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Events příkazu!"
      }
    }
  }
  
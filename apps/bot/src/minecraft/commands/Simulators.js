module.exports = {
  name: "Simulators",
  aliases: ["sim", "sims", "simulators", "simulator", "scuba", "grinch", "eastersimulator", "scubasimulator", "halloweensimulator", "grinchsimulator"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let easter = api.hypixel.stats.arcade.simulators.easter
      let scuba = api.hypixel.stats.arcade.simulators.scuba
      let halloween = api.hypixel.stats.arcade.simulators.halloween
      let grinch = api.hypixel.stats.arcade.simulators.grinch
      let message = `**Simulators**: **${api.username}** - Easter: ${easter.wins}Wins - Scuba: ${scuba.wins}Wins - Halloween: ${halloween.wins}Wins - Grinch: ${grinch.wins}Wins`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Simulators příkazu!"
    }
  }
}

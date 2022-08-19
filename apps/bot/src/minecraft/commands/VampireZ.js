module.exports = {
  name: "VampireZ",
  aliases: ["vz", "vampirez", "vampire"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let vz = api.hypixel.stats.vampirez
      let message = `**VampireZ**: [${vz.wins}]H [${vz.humankills}]V **${api.username}** - Wins: ${vz.humanwins}H ${vz.vampirewins}V, Kills: ${vz.vampirekills}V ${vz.humankills}H ${vz.zombiekills}Z`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v VampireZ příkazu!"
    }
  }
}

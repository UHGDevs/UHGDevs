module.exports = {
  name: "Paintball",
  aliases: ["paint", "paintball", "pb"],
  run: async (uhg, pmsg) => {
    const f = uhg.f
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let pb = api.hypixel.stats.paintball
      let message = `**Paintball**: [${uhg.r(pb.kills)}] **${api.username}** - ${f(pb.wins)} Wins ${f(pb.kills)} Kills ${f(pb.kdr)} KDR`

      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Paintball příkazu!"
    }
  }
}

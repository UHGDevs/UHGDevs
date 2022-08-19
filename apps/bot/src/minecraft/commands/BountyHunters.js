module.exports = {
  name: "BountyHunters",
  aliases: ["bountyhunters", "bounty", "bh"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let bh = api.hypixel.stats.arcade.bountyhunters
      let message = `**BountyHunters**: **${api.username}** - ${uhg.f(bh.wins)}Wins ${uhg.f(bh.kills)}Kills ${bh.kdr}KDR ${uhg.f(bh.bountykills)} Bounty Kills`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v BountyHunters příkazu!"
    }
  }
}

module.exports = {
  name: "Discord",
  aliases: ["discord", "social", "socials", "dc"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let socials = api.hypixel
      let msg = socials.links.DISCORD
      if (!socials.links.DISCORD) msg = "Nemá propojený Discord s Hypixelem"
      let message = `**Discord**: **${api.username}** - ${msg}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Discord příkazu!"
    }
  }
}

module.exports = {
  name: "Discord",
  aliases: ["discord", "social", "socials", "dc"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
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

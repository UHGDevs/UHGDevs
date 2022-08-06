module.exports = {
  name: "PixelPainters",
  aliases: ["pixelpainters", "pixel", "painters", "pp"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let pp = api.hypixel.stats.arcade.pixelpainters
      let message = `**PixelPainters**: **${api.username}** - ${uhg.f(pp.wins)}Wins`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v PixelPainters příkazu!"
    }
  }
}

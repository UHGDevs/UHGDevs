module.exports = {
  name: "PixelPainters",
  aliases: ["pixelpainters", "pixel", "painters", "pp"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.api.call(pmsg.nickname)
      if (!api.success) return api.reason
      let pp = api.hypixel.stats.arcade.pixelpainters
      let message = `**PixelPainters**: **${api.username}** - ${uhg.f(pp.wins)}Wins`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v PixelPainters příkazu!"
    }
  }
}

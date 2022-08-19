module.exports = {
  name: "Karma",
  aliases: ["karma"],
  run: async (uhg, pmsg) => {
    try{
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname)
      if (!api.success) return api.reason
      let karma = api.hypixel
      let message = `**${api.username}** - ${uhg.f(karma.karma)} Karma`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Karma příkazu!"
    }
  }
}

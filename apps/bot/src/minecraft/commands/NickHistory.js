module.exports = {
  name: "NickHistory",
  aliases: ["nickhistory", "namehistory", "history", "names", "nicks"],
  run: async (uhg, pmsg) => {
    try{
      let api = await uhg.getApi(pmsg.nickname)
      if (api instanceof Object == false) return api
      let nicks = api.hypixel
      let message = `**${api.username}** - ${nicks.nicks.join(", ")}`
      //if (message.length > 256) message = "Pro jistotu ty nicky nenapíšu, abych se nepřehřál, těch nicků jich je moc na mě"
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v NickHistory příkazu!"
    }
  }
}

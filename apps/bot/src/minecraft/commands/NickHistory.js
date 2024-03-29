module.exports = {
  name: "NickHistory",
  aliases: ["nickhistory", "namehistory", "history", "names", "nicks"],
  run: async (uhg, pmsg) => {
    try{
      return "Mojang vymazal Nickname History z API, tudíž tato feature je mimo provoz"
      let api = await uhg.api.call(pmsg.nickname, ['mojang'], {verify: pmsg.verify_data})
      if (!api.success) return api.reason
      let message = `**${api.username}** - ${api.names.join(", ")}`
      //if (message.length > 256) message = "Pro jistotu ty nicky nenapíšu, abych se nepřehřál, těch nicků jich je moc na mě"
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v NickHistory příkazu!"
    }
  }
}

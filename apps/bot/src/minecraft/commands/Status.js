module.exports = {
  name: "Status",
  aliases: ["status", "online", "onlinestatus", "o"],
  run: async (uhg, pmsg) => {
    try{
      let { onlinegame, onlinemode, onlinemap } = "david>all"
      let api = await uhg.api.call(pmsg.nickname, ['online'])
      if (!api.success) return api.reason

      if (!api.online.online) return `[${api.online.title}] **${api.username}**`

      if (api.online.game) onlinegame = " - " + api.online.game + " "
      if (api.online.mode) onlinemode =  api.online.mode + " "
      if (api.online.map) onlinemap = `(${api.online.map})`
      let message = `[${api.online.title}] **${api.username}**${onlinegame||" "}${(onlinemode)||""}${onlinemap||""}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Status příkazu!"
    }
  }
}

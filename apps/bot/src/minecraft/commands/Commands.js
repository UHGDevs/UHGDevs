module.exports = {
  name: "Commands",
  aliases: ["commands", "command", "cmd", "cmds", "cmnd", "cmnds"],
  run: async (uhg, pmsg) => {
    try{
      let message = `Dostupné příkazy: https://imgur.com/a/GAsBy5o`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v cmd příkazu!"
    }
  }
}

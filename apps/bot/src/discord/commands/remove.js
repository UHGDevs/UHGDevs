module.exports = {
  name: "remove",
  aliases: [],
  allowedids: ["312861502073995265", "379640544143343618", "427198829935460353", "378928808989949964"],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      if (!content) return "Nezadal jsi jméno"
      let args = content.split(" ").filter(n => n)
      if (!args.length) return "Nezadal jsi jméno"

      let api = await uhg.getApi(args[0], ["mojang"])
      if (api instanceof Object == false) return api
      
      uhg.mongo.run.delete("stats", "stats", { _id: api.uuid })

      return `${api.username} byl odebrán z databáze`
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v remove příkazu!"
    }
  }
}

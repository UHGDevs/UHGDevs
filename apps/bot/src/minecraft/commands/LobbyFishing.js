module.exports = {
    name: "LobbyFishing",
    aliases: ["lf", "lobbyfishing", "mainlobbyfishing", "lobbyfish"],
    run: async (uhg, pmsg) => {
      try{
        let api = await uhg.api.call(pmsg.nickname)
        if (!api.success) return api.reason
        let fishing = api.hypixel.fishing
        let message = `Lobby Fishing: **${api.username}** - ${uhg.f(fishing.fish)} Fish, ${uhg.f(fishing.junk)} Junk, ${uhg.f(fishing.treasure)} Treasure`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v LobbyFishing příkazu!"
      }
    }
  }
  
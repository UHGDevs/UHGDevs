
const func = require('../util/ApiFunctions');

class Online {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "online", reason: 'Status API needs player UUID to be called!'};
    const uuid = options.uuid;

    const apikey = client.getKey()
    if (!apikey) return  {success: false, type: "online", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "online", reason: 'Hypixel API key limit reached!'};

    let online;
    try { online = await client.callHypixel.get('status', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "online", reason: 'Hypixel Status API is getting touble!'}};
    if (!online.success) return  {success: false, type: "online", reason: online.cause};
    online = online.session

    const api = { success: true, type: 'online'}  

    if (!online.online) {
      api.online = false
      api.icon = "https://cdn.discordapp.com/attachments/875503784086892617/896772378678394890/unknown.png"
      api.footer ='Vývojáři Farmans & DavidCzPdy'
      api.title= "Offline"
    } else {
      api.title = "Online"

      let game = func.renameHypixelGames(online.gameType) || null
      online.game = game

      let mode = func.getGamemode(online.mode) || null
      
      if (mode == "LOBBY") {
        api.modtitle = "Mode"
        api.footer = `Je v ${game} Lobby`
        api.type = `${game} Lobby`
        api.mode = mode
      } else if (game == "replay"){
        api.footer = `Sleduje replay`
      } else {
        if (game == "SkyBlock") api.modtitle = "SkyBlock Místo"
        else api.modtitle = "Mode"
        api.footer = `Hraje ${game}`
        api.type = game
        api.map = online.map || null
        api.mode = mode
      }

      api.online = true,
      api.icon = "https://cdn.discordapp.com/attachments/875503784086892617/896771219817365514/unknown.png"
    }


    return api
  }
}

module.exports = Online;

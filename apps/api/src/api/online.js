
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
    try { online = await client.callHypixel.get('status', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "online", reason: e.response ? e.response.data.cause : 'Online API error'}};
    if (!online.success) return  {success: false, type: "online", reason: online.cause};
    online = online.session

    const api = { success: true, type: 'online'} 
    

    if (!online.online) {
      api.online = false
      api.icon = "https://cdn.discordapp.com/attachments/875503784086892617/896772378678394890/unknown.png"
      api.footer ='Vývojáři Farmans & DavidCzPdy'
      api.title = 'Offline'
      api.status = '🔴 Offline'

      let hypCache = client.users.get(client.aliases.get(uuid)).cache.hypixel
      if (hypCache && hypCache.lastLogin == -1) api.title = 'API OFF'
      else if (!hypCache) {
        try {
          let hypixel = await client.callHypixel.get('player', {params: { key: client.getKey(), uuid: uuid }}).then( n => n.data )
          if (hypixel.success && hypixel.player && !hypixel.player.lastLogin) api.title= "API OFF"
        } catch (e) {api.title = 'Offline (er)'}
      }
    } else {

      api.title = "Online"

      let game = func.renameHypixelGames(online.gameType) || null
      api.game = game

      let mode = func.getGamemode(online.mode) || null
      
      if (mode == "LOBBY") {
        api.modtitle = "Mode"
        api.footer = `Je v ${game} Lobby`
        api.typ = `${game} Lobby`
        api.mode = func.getStatus(mode)
      } else if (game == "replay"){
        api.footer = `Sleduje replay`
      } else {
        if (game == "SkyBlock") api.modtitle = "SkyBlock Místo"
        else api.modtitle = "Mode"
        api.footer = `Hraje ${game}`
        api.typ = game
        api.map = online.map || null
        api.mode = func.getStatus(mode)
      }
      api.status = '🟢 ' + api.footer
      api.online = true,
      api.icon = "https://cdn.discordapp.com/attachments/875503784086892617/896771219817365514/unknown.png"
    }


    return api
  }
}

module.exports = Online;

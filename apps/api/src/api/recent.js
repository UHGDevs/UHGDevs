
const func = require('../util/ApiFunctions');

class Recent {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "recent", reason: 'RecentGames API needs player UUID to be called!'};
    const uuid = options.uuid;

    const apikey = client.getKey()
    if (!apikey) return  {success: false, type: "recent", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "recent", reason: 'Hypixel API key limit reached!'};

    let recent;
    try { recent = await client.callHypixel.get('recentgames', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "recent", reason: e.response ? e.response.data.cause : 'RecentGames API error'}};
    if (!recent.success) return  {success: false, type: "recent", reason: recent.cause};

    const api = { success: true, type: 'recent', games: recent.games }    

    return api
  }
}

module.exports = Recent;

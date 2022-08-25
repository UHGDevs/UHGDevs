
const func = require('../util/ApiFunctions');

class Friends {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "friends", reason: 'Friends API needs player UUID or friends NAME to be called!'};
    const uuid = options.uuid;

    const apikey = client.getKey()
    if (!apikey) return  {success: false, type: "friends", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "friends", reason: 'Hypixel API key limit reached!'};

    let friends;
    try { friends = await client.callHypixel.get('friends', {params: { key: apikey, player: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "friends", reason: e.response ? e.response.data.cause : 'Friends API error'}};
    if (!friends.success) return  {success: false, type: "friends", reason: friends.cause};

    const api = { success: true, type: 'friends', friends: friends.records, friendsNum: friends.records.length }


    return api
  }
}

module.exports = Friends;


const fs = require('fs');
const path = require('path');

const func = require('../util/ApiFunctions');

class Hypixel {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "hypixel", reason: 'Hypixel API needs UUID to be called!'};
    const uuid = options.uuid;

    const apikey = client.getKey() // needs fix - slow loading
    if (!apikey) return  {success: false, type: "hypixel", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "hypixel", reason: 'Hypixel API key limit reached!'};

    let hypixel;
    try { hypixel = await client.callHypixel.get('player', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) { hypixel = e.response?.data || {}};
    if (!hypixel.success) return  {success: false, type: "hypixel", reason: `Hypixel API: ${hypixel.cause || 'error'}`};
    if (!hypixel.player) return  {success: false, type: "hypixel", reason: `Hypixel API: Hráč nikdy nebyl na Hypixelu`};
    if (!hypixel.player.stats) return  {success: false, type: "hypixel", reason: `Hypixel API: Hráč nehrál žádnou minihru`};

    hypixel = hypixel.player;

    const api = await require('./games/general')(hypixel, uuid, client, options.user.username)

    options.user.cache.hypixel_achievements = hypixel.achievements || {}
    
    const mw = hypixel.stats.Walls3 || {};
    const smash = hypixel.stats.SuperSmash || {};
    const tnt = hypixel.stats.TNTGames || {};
    const warlords = hypixel.stats.Battleground || {};

    const ctourney = hypixel.tourney ? hypixel.tourney[client.options.currentTourney] || {} : {};

    api.stats = {};
    for (let file of fs.readdirSync(path.resolve(__dirname, `./games/`)).filter((file) => file.endsWith('.js') && file !== 'general.js')) {
      api.stats[file.split('.')[0]] = require(`./games/${file}`) (hypixel);
    }


    /* UPLOADING HYPIXEL STATS TO DB */
    /* only if player is in db already*/
    if (client.mongo) {
      client.mUpdate("stats", "stats", {_id: uuid}, api, false)
    }
    
    return api
  }
}

module.exports = Hypixel;


const fs = require('fs');

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
    try { hypixel = await client.callHypixel.get('player', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "hypixel", reason: 'Hypixel API is getting touble!'}};
    if (!hypixel.success) return  {success: false, type: "hypixel", reason: `Hypixel API: ${hypixel.cause || 'error'}`};
    if (!hypixel.player.stats) return  {success: false, type: "hypixel", reason: `Hypixel API: Hráč nehrál žádnou minihru`};

    hypixel = hypixel.player;

    const api = await require('./games/general')(hypixel, uuid, client)

    
    const mw = hypixel.stats.Walls3 || {};
    const smash = hypixel.stats.SuperSmash || {};
    const tnt = hypixel.stats.TNTGames || {};
    const warlords = hypixel.stats.Battleground || {};

    const ctourney = hypixel.tourney ? hypixel.tourney[client.options.currentTourney] || {} : {};

    api.stats = {};
    for (let file of fs.readdirSync(`../api/src/api/games/`).filter((file) => file.endsWith('.js') && file !== 'general.js')) {
        api.stats[file.split('.')[0]] = require(`./games/${file}`) (hypixel);
    }


    /* UPLOAD DB HERE */

    delete api._id
    delete api.updated
    return api
  }
}

module.exports = Hypixel;

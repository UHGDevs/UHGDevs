
const fs = require('fs');

const fetch = require('node-fetch');
const func = require('../util/ApiFunctions');

class Hypixel {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "hypixel", reason: 'Hypixel API needs UUID to be called!'};
    const uuid = options.uuid;
    
    const apikey = client.getKey();
    if (!apikey) return  {success: false, type: "hypixel", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "hypixel", reason: 'Hypixel API key limit reached!'};

    let hypixel;

    try { hypixel = await fetch(`https://api.hypixel.net/player?key=${apikey}&uuid=${uuid}`).then(api => api.json()) } catch (e) {return {success: false, type: "hypixel", reason: 'Hypixel API is getting touble!'}};
    if (!hypixel.success) return  {success: false, type: "hypixel", reason: `Hypixel API: ${hypixel.cause || 'error'}`};
    if (!hypixel.player.stats) return  {success: false, type: "hypixel", reason: `Hypixel API: Hráč nehrál žádnou minihru`};

    hypixel = hypixel.player;

    const api = require('./games/general')(hypixel, uuid)

    
    const mw = hypixel.stats.Walls3 || {};
    const pb = hypixel.stats.Paintball || {};
    const smash = hypixel.stats.SuperSmash || {};
    const speeduhc = hypixel.stats.SpeedUHC || {};
    const tkr = hypixel.stats.GingerBread || {};
    const tnt = hypixel.stats.TNTGames || {};
    const uhc = hypixel.stats.UHC || {};
    const vampirez = hypixel.stats.VampireZ || {};
    const walls = hypixel.stats.Walls || {};
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

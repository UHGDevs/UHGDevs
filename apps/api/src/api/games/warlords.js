
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const warlords = hypixel.stats.Battleground || {};
    const achievements = hypixel.achievements || {}

    return ({
      coins: warlords.coins || 0,
      wins: warlords.wins || 0,
      losses: warlords.losses || 0,
      wlr: func.ratio(warlords.wins, warlords.losses) || 0,
      kills: warlords.kills || 0,
      deaths: warlords.deaths || 0,
      kdr: func.ratio(warlords.kills, warlords.deaths) || 0,
      assists: warlords.assists || 0,
      killassists: (warlords.kills || 0)+(warlords.assists || 0),
      flagreturns: warlords.flag_returns || 0,
      flagcaptures: warlords.flag_conquer_self || 0,
      flags: (warlords.flag_returns || 0)+(warlords.flag_conquer_self || 0)
    })

}





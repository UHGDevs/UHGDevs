
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const mw = hypixel.stats.Walls3 || {};
    const achievements = hypixel.achievements || {}

    return ({
      coins: mw.coins || 0,
      games: mw.games_played || 0,
      wins: mw.wins || 0,
      losses: mw.losses || 0,
      wlr: func.ratio(mw.wins, mw.losses) || 0,
      kills: mw.kills || 0,
      deaths: mw.deaths || 0,
      kdr: func.ratio(mw.kills, mw.deaths) || 0,
      assists: mw.assists || 0,
      fka: mw.total_final_kills || 0,
      witherdmg: mw.wither_damage || 0
    })

}





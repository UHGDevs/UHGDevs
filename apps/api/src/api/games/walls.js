
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const walls = hypixel.stats.Walls || {};
    const achievements = hypixel.achievements || {}

    return ({
      coins: walls.coins || 0,
      wins: walls.wins || 0,
      losses: walls.losses || 0,
      wlr: func.ratio(walls.wins, walls.losses) || 0,
      kills: walls.kills || 0,
      deaths: walls.deaths || 0,
      kdr: func.ratio(walls.kills, walls.deaths) || 0,
      assists: walls.assists || 0,
    })

}





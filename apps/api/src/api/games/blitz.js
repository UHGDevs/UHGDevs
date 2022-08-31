
const { ratio } = require('../../util/ApiFunctions');
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const blitz = hypixel.stats.HungerGames || {};
    const achievements = hypixel.achievements || {}
    
    return ({
      coins: blitz.coins || 0,
      wins: (blitz.wins || 0)+(blitz.wins_teams || 0),
      deaths: blitz.deaths || 0,
      kills: blitz.kills || 0,
      kdr: func.ratio(blitz.kills, blitz.deaths, 2),
      damage: blitz.damage || 0,
      games: blitz.games_played || 0,
      playtime: blitz.time_played || 0,
      defaultkit: blitz.defaultkit || 'None',
    })

}





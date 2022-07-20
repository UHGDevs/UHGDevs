
const { ratio } = require('../../util/ApiFunctions');
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const cac = hypixel.stats.MCGO || {};
    const achievements = hypixel.achievements || {}
    
    const api = {
      coins: cac.coins || 0,
      wins: (cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(cac.game_wins_gungame || 0),
      roundwins: cac.round_wins || 0,
      kills: (cac.kills || 0)+(cac.headshot_kills || 0),
      headshotkills: cac.headshot_kills || 0,
      nadekills: cac.grenade_kills || 0,
      deaths: cac.deaths || 0,
      assists: cac.assists || 0,
      bombsplanted: cac.bombs_planted || 0,
      bombsdefused: cac.bombs_defused || 0,
      shots: cac.shots_fired || 0,
    }
    api.score = Math.round(api.kills/2 + (api.bombsdefused + api.bombsplanted)/3 + api.wins + api.kills / api.shots * 200)
    api.color = func.getCaC(api.score)

    return api

    


}





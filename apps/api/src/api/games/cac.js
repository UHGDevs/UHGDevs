
const { ratio } = require('../../util/ApiFunctions');
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const cac = hypixel.stats.MCGO || {};
    const achievements = hypixel.achievements || {}
    
    const api = {
      coins: cac.coins || 0,
      overall: {
        wins: (cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(cac.game_wins_gungame || 0),
        roundwins: cac.round_wins || 0,
        kills: (cac.kills || 0)+(cac.headshot_kills || 0)+(cac.grenade_kills || 0)+(cac.kills_deathmatch || 0)+(cac.kills_gungame || 0),
        kdr: ratio((cac.kills || 0)+(cac.headshot_kills || 0)+(cac.grenade_kills || 0)+(cac.kills_deathmatch || 0)+(cac.kills_gungame || 0), (cac.deaths || 0)+(cac.deaths_deathmatch || 0)+(cac.deaths_gungame || 0)),
        headshotkills: cac.headshot_kills || 0,
        grenadekills: cac.grenade_kills || 0,
        deaths: (cac.deaths || 0)+(cac.deaths_deathmatch || 0)+(cac.deaths_gungame || 0),
        assists: (cac.assists || 0)+(cac.assists_gungame || 0)+(cac.assists_deathmatch || 0),
        shots: cac.shots_fired || 0,
      },
      defusal: {
        wins: cac.game_wins || 0,
        kills: cac.kills || 0,
        deaths: cac.deaths || 0,
        kdr: ratio(cac.kills || 0, cac.deaths || 0),
        assists: cac.assists || 0,
        bombsplanted: cac.bombs_planted || 0,
        bombsdefused: cac.bombs_defused || 0,
        bombs:  (cac.bombs_planted || 0) + (cac.bombs_defused || 0)
      },
      deathmatch: {
        wins: cac.game_wins_deathmatch || 0,
        kills: cac.kills_deathmatch || 0,
        deaths: cac.deaths_deathmatch || 0,
        kdr: ratio(cac.kills_deathmatch || 0, cac.deaths_deathmatch || 0),
        assists: cac.assists_deathmatch || 0,
      },
      gungame: {
        wins: cac.game_wins_gungame || 0,
        kills: cac.kills_gungame || 0,
        deaths: cac.deaths_gungame || 0,
        kdr: ratio(cac.kills_gungame || 0, cac.deaths_gungame || 0),
        assists: cac.assists_gungame || 0,
        besttime: cac.fastest_win_gungame || 0,
      },
    }
    api.score = Math.round(api.overall.kills/2 + (api.defusal.bombsdefused + api.defusal.bombsplanted)/3 + api.overall.wins + api.overall.kills / api.overall.shots * 200)
    api.color = func.getCaC(api.score)

    return api

    


}





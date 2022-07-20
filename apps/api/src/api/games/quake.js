
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const quake = hypixel.stats.Quake || {};
    const achievements = hypixel.achievements || {}
   
    return ({
      coins: quake.coins || 0,
      bestkillstreak: quake.highest_killstreak || 0,
      kills: (quake.kills||0)+quake.kills_teams || 0,
      deaths: (quake.deaths||0)+quake.deaths_teams || 0,
      kdr: func.ratio((quake.kills||0) + (quake.kills_teams||0), (quake.deaths||0) + (quake.deaths_teams||0)),
      wins: (quake.wins||0) + quake.wins_teams || 0,
      headshots: (quake.headshots||0) + quake.headshots_teams || 0,
    })

}





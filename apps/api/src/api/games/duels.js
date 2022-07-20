
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const duels = hypixel.stats.Duels || {};
    const achievements = hypixel.achievements || {}
   
    return ({
        coins: duels.coins || 0,
        winstreak: duels.current_winstreak || 0,
        bestwinstreak: duels.best_overall_winstreak || 0,
        wins: duels.wins || 0,
        losses: duels.losses || 0,
        wlr: func.ratio((duels.wins || 0), (duels.losses || 0)),
        kills: duels.kills || 0,
        deaths: duels.deaths || 0,
        kdr: func.ratio((duels.kills || 0), (duels.deaths || 0)),
        games: duels.games_played_duels || 0,
        lootchests: duels.duels_chests || 0,
      })

}





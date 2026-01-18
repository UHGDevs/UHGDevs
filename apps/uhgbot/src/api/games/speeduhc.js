
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const speeduhc = hypixel.stats.SpeedUHC || {};
    const achievements = hypixel.achievements || {}
   
    return ({
        coins: speeduhc.coins || 0,
        winstreak: speeduhc.win_streak || speeduhc.winstreak || 0,
        highestwinstreak: speeduhc.highestWinstreak || 0,
        killstreak: speeduhc.killstreak || 0,
        highestkillstreak: speeduhc.highestKillstreak || 0,
        wins: speeduhc.wins || 0,
        losses: speeduhc.losses || 0,
        wlr: func.ratio(speeduhc.wins || 0, speeduhc.losses || 0),
        kills: speeduhc.kills || 0,
        deaths: speeduhc.deaths || 0,
        kdr: func.ratio(speeduhc.kills || 0, speeduhc.deaths || 0),
        assists: speeduhc.assists || 0,
        score: speeduhc.score_normal || 0,
        level: func.getSpeedUHC(speeduhc.score_normal || 0),
        masterperk: func.getSpeedUHCPerk(speeduhc.activeMasterPerk || "None")
    })

}





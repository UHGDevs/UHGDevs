
const { ratio } = require('../ApiFunctions');
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const smash = hypixel.stats.SuperSmash || {};
    const achievements = hypixel.achievements || {};

    return ({
        coins: smash.coins || 0,
        level: smash.smashLevel || smash.smash_level_total || 0,
        winstreak: smash.win_streak || 0,
        games: smash.games || 0,
        wins: smash.wins || 0,
        losses: smash.losses || 0,
        wlr: ratio(smash.wins || 0, smash.losses || 0),
        kills: smash.kills || 0,
        deaths: smash.deaths || 0,
        kdr: ratio(smash.kills || 0, smash.deaths || 0),
        assists: smash.assists || 0
    })

}





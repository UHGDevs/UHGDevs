
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const vampirez = hypixel.stats.VampireZ || {};
    const achievements = hypixel.achievements || {}
   
    return ({
        coins: vampirez.coins || 0,
        wins: (vampirez.human_wins || 0) + (vampirez.vampire_wins || 0),
        humanwins: vampirez.human_wins || 0,
        vampirewins: vampirez.vampire_wins || 0,
        kills: (vampirez.zombie_kills || 0) + (vampirez.vampire_kills || 0) + (vampirez.human_kills || 0),
        vampirekills: vampirez.vampire_kills || 0,
        zombiekills: vampirez.zombie_kills || 0,
        humandeaths: vampirez.human_deaths || 0,
        vampiredeaths: vampirez.vampire_deaths || 0,
        goldbought: vampirez.gold_bought || 0,
        humankills: vampirez.human_kills || 0,
    })

}






const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const uhc = hypixel.stats.UHC || {};
    const achievements = hypixel.achievements || {}

    return ({
      coins: uhc.coins || 0,
      wins: (uhc.wins || 0)+(uhc.wins_solo || 0),
      kills: (uhc.kills || 0)+(uhc.kills_solo || 0),
      deaths: (uhc.deaths || 0)+(uhc.deaths_solo || 0),
      kdr: func.ratio((uhc.kills || 0)+(uhc.kills_solo || 0), (uhc.deaths || 0)+(uhc.deaths_solo || 0)),
      kit: uhc.equippedKit || "NONE",
      score: uhc.score || 0,
      ultimates: (uhc.ultimates_crafted || 0)+(uhc.ultimates_crafted_solo || 0),
      extraultimates: (uhc.extra_ultimates_crafted_solo || 0)+(uhc.extra_ultimates_crafted || 0),
      level: func.getUHC(uhc.score || 0)
    })

}





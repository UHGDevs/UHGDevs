
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const pb = hypixel.stats.Paintball || {};
    const achievements = hypixel.achievements || {}
   
    return ({
        coins: pb.coins || 0,
        wins: pb.wins || 0,
        kills: pb.kills || 0,
        deaths: pb.deaths || 0,
        kdr: func.ratio(pb.kills || 0, pb.deaths || 0),
        shots: pb.shots_fired || 0,
        killstreaks: pb.killstreaks || 0,
        hat: pb.hat || "None",
        prefix: pb.selectedKillPrefix || "",
        forcefield: achievements.paintball_invincible || 0,
    })

}





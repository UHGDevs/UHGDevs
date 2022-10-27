
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const pit = hypixel.stats.Pit || {};
    const achievements = hypixel.achievements || {}

    let pitprofile = pit.profile || {}

    let exp_map = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500]
    let prestige_map = [100, 110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 2800, 3200, 3600, 4000, 4500, 5000, 7500, 10000, 10100, 10100, 10100, 10100, 10100]
    let prestige_exp = [65935, 138458, 217580, 303290, 395599, 494496, 609869, 741739, 906571, 1104376, 1368116, 1697791, 2093401, 2554946, 3082426, 3675841, 4335191, 5126411, 6049501, 7104461, 8291291, 9609991, 11192431, 13038611, 15148531, 17522191, 20159591, 23126666, 26423416, 31368541, 37962041, 44621476, 51280911, 57940346, 64599781, 71259216]
    let pitxp = pitprofile.xp || 0
    for (var pitprestige = 0; pitprestige < 35; pitprestige++) if (pitxp < prestige_exp[pitprestige]) break;

    pitxp = pitxp - prestige_exp[pitprestige - 1] || pitprofile.xp
    let pitlevel = 1;
    while (pitxp > 0) {
      pitxp -= exp_map[Math.floor(pitlevel/10)] * prestige_map[pitprestige] / 100;
      pitlevel++;
    }
    pitlevel-=1
   
    let pit_stats_ptl = pit.pit_stats_ptl || {}
    return ({
      gold: func.f(pitprofile.cash || 0) || 0,
      renown: pitprofile.renown || 0,
      totalrenown: achievements.pit_renown || 0,
      xp: pitprofile.xp || 0,
      prestige: pitprestige,
      prestigeroman: func.romanize(pitprestige),
      level: pitlevel,
      deaths: pit_stats_ptl.deaths || 0,
      kills: pit_stats_ptl.kills || 0,
      kdr: func.ratio(pit_stats_ptl.kills, pit_stats_ptl.deaths) || 0,
      playtimeraw: pit_stats_ptl.playtime_minutes || 0,
      playtime: func.f(func.toTime(pit_stats_ptl.playtime_minutes).m, 0)+"h" || "0h",
      contracts: pit_stats_ptl.contracts_completed || 0,
    })

}





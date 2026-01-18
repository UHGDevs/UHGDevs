const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const pit = hypixel.stats.Pit || {};
    const pitprofile = pit.profile || {};
    const pit_stats_ptl = pit.pit_stats_ptl || {};

    // Výpočet Prestige a Levelu (zachováno)
    let exp_map = [15, 30, 50, 75, 125, 300, 600, 800, 900, 1000, 1200, 1500];
    let prestige_map = [100, 110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 2800, 3200, 3600, 4000, 4500, 5000, 7500, 10000, 10100, 10100, 10100, 10100, 10100];
    let prestige_exp = [65935, 138458, 217580, 303290, 395599, 494496, 609869, 741739, 906571, 1104376, 1368116, 1697791, 2093401, 2554946, 3082426, 3675841, 4335191, 5126411, 6049501, 7104461, 8291291, 9609991, 11192431, 13038611, 15148531, 17522191, 20159591, 23126666, 26423416, 31368541, 37962041, 44621476, 51280911, 57940346, 64599781, 71259216];
    
    let pitxp = pitprofile.xp || 0;
    let pitprestige = 0;
    for (var i = 0; i < 35; i++) if (pitxp < prestige_exp[i]) { pitprestige = i; break; }
    if (pitxp >= prestige_exp[34]) pitprestige = 35;

    let xpCurrent = pitxp - (prestige_exp[pitprestige - 1] || 0);
    let pitlevel = 1;
    while (xpCurrent > 0 && pitlevel < 120) {
        let xpNeeded = exp_map[Math.floor(pitlevel/10)] * prestige_map[pitprestige] / 100;
        if (xpCurrent >= xpNeeded) {
            xpCurrent -= xpNeeded;
            pitlevel++;
        } else {
            break;
        }
    }

    // Playtime logika
    const minutes = pit_stats_ptl.playtime_minutes || 0;
    const timeObj = func.toTime(minutes * 60); // Převod minut na sekundy pro funkci toTime

    return ({
        gold: pitprofile.cash || 0,
        renown: pitprofile.renown || 0,
        totalrenown: hypixel.achievements?.pit_renown || 0,
        xp: pitprofile.xp || 0,
        prestige: pitprestige,
        prestigeroman: func.romanize(pitprestige),
        level: pitlevel,
        deaths: pit_stats_ptl.deaths || 0,
        kills: pit_stats_ptl.kills || 0,
        kdr: func.ratio(pit_stats_ptl.kills, pit_stats_ptl.deaths),
        contracts: pit_stats_ptl.contracts_completed || 0,
        
        // Rozšířený playtime
        rawplaytime: minutes, // Pro LB sortování (v minutách)
        playtime_hours: Math.floor(minutes / 60), // Pro starší kompatibilitu
        playtime_formatted: timeObj.formatted // "5d 12h 30m"
    });
};
/**
 * src/utils/achievements.js
 * Logika pro výpočet Legacy Achievement Points.
 */

/**
 * Projde legacy definice a porovná je s daty hráče z API.
 * @param {Object} legacyData - Data z achievements.json (sekce legacy)
 * @param {String[]} oneTime - hypixel.achievementsOneTime z API
 * @param {Object} tiered - hypixel.achievements z API
 */
exports.countPoints = async (legacyData, oneTime = [], tiered = {}) => {
  if (!legacyData) return 0;
  let points = 0;

  // Procházíme každou hru v legacy datech (např. "paintball", "arena"...)
  for (const game in legacyData) {
    const gameAchievements = legacyData[game];
    if (!Array.isArray(gameAchievements)) continue;

    for (const ach of gameAchievements) {
      // Sestavíme jméno achievementu tak, jak ho má Hypixel v API (např. "paintball_hat_collector")
      // Odstraníme mezery a nealfanumerické znaky pro jistotu
      let achName = `${game}_${ach.search}`.toLowerCase().replace(/ /g, '_').replace(/[^\w]/g, '');

      if (ach.tiers) {
        // TIERED ACHIEVEMENT (např. 100 kills, 500 kills...)
        // V tiered (hypixel.achievements) je uložena hodnota (číslo)
        let playerValue = tiered[achName] || 0;
        let tieredPoints = 0;
        
        // Sečteme body za všechny splněné tiery
        ach.tiers.forEach(tier => {
          if (playerValue >= tier.amount) {
            tieredPoints += tier.points;
          }
        });
        points += tieredPoints;
      } else {
        // ONE-TIME ACHIEVEMENT
        // V oneTime (hypixel.achievementsOneTime) je pole získaných ID
        if (oneTime.includes(achName)) {
          points += (ach.points || 0);
        }
      }
    }
  }
  return points;
}

/**
 * Pomocná funkce pro vytažení legacy achievementů z celkového seznamu (pokud bys chtěl generovat JSON znovu)
 */
exports.getLegacy = async (uhg, allAchievements) => {
  let legacyMap = {};
  for (const game in allAchievements) {
    let list = [];
    
    // One time
    for (const id in allAchievements[game].one_time) {
      let data = allAchievements[game].one_time[id];
      if (data.legacy) {
        data.search = id;
        list.push(data);
      }
    }
    
    // Tiered
    for (const id in allAchievements[game].tiered) {
      let data = allAchievements[game].tiered[id];
      if (data.legacy) {
        data.search = id;
        list.push(data);
      }
    }

    if (list.length) legacyMap[game] = list;
  }
  return legacyMap;
}
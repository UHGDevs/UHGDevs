
exports.getLegacy = async (achievements) => {
  let legacyAps = {}
  for (game in achievements) {
    let legacy = Object.values(achievements[game].one_time).filter((n, i) => {
      n.search = Object.keys(achievements[game].one_time)[i]
      return n.legacy
    }).concat(Object.values(achievements[game].tiered).filter((n, i) => {
      n.search = Object.keys(achievements[game].tiered)[i]
      return n.legacy
    }))
    if (!legacy.length) continue
    legacyAps[game] = legacy
  }
  return legacyAps
}

exports.countPoints = async (legacy, oneTime = [], tiered = {}) => {
  let aps = 0;
  for (const game in legacy) {
    for (let i = 0; i < legacy[game].length; i++) {
      let ap = legacy[game][i]
      let name = `${game}_${ap.search}`.toLowerCase().replaceAll(' ', '_').replace(/\W/g, '')
      if (ap.tiers) {
        if (Object.keys(tiered).includes(name)) {
          let stat = tiered[name]
          let tiers = 0
          ap.tiers.filter(n => stat >= n.amount ).forEach(a => {tiers += a.points});
          aps += tiers
        }
      } else if (oneTime.includes(name)) {
        aps += ap.points
      }
    }
  }
  return aps
}

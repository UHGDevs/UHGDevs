
const func = require('../../util/ApiFunctions');

module.exports = async (hypixel = {} , uuid, client, username) => {
  const achievements = hypixel.achievements || {};
  const legacy = hypixel.stats.Legacy || {}

  let legacyAps = await require('../../util/achievements').countPoints(client.aps ? client.aps.legacy: await client.cacheAps(), hypixel.achievementsOneTime, achievements)
  return ({
    success: true,
    type: 'hypixel',
    _id: uuid,
    uuid: uuid,
    username: username || hypixel.displayname,
    rank: func.getRank(hypixel).rank,
    prefix: func.getRank(hypixel).prefix,
    color: func.getPlusColor(func.getRank(hypixel).rank, hypixel.rankPlusColor).hex,
    level: func.getNwLevel(hypixel.networkExp || 0),
    karma: hypixel.karma || 0,
    aps: hypixel.achievementPoints || 0,
    legacyAps: legacyAps,
    links: hypixel.socialMedia ? hypixel.socialMedia.links || {} : {},
    discord: (hypixel.socialMedia ? (hypixel.socialMedia.links ? hypixel.socialMedia.links.DISCORD : null) : null) || 'Žádný',
    fishing: {
      fish: achievements.general_master_lure || 0,
      junk: achievements.general_trashiest_diver || 0,
      treasure: achievements.general_luckiest_of_the_sea || 0,
    },
    ranksGiven:  hypixel.giftingMeta ? hypixel.giftingMeta.ranksGiven || 0 : 0,
    giftsGiven: hypixel.giftingMeta ? hypixel.giftingMeta.giftsGiven || 0 : 0,
    quests: achievements.general_quest_master || 0,
    challenges: achievements.general_challenger || 0,
    legacyTokens: legacy.total_tokens || 0,
    userLanguage: hypixel.userLanguage || "ENGLISH",
    firstLogin: hypixel.firstLogin || -1,
    lastLogin: hypixel.lastLogin || -1,
    treasureHunter: hypixel.vanityMeta && hypixel.vanityMeta.packages ? {
      helmet: hypixel.vanityMeta.packages.includes("suit_treasure_helmet"),
      chestplate: hypixel.vanityMeta.packages.includes("suit_treasure_chestplate"),
      leggings: hypixel.vanityMeta.packages.includes("suit_treasure_leggings"),
      boots: hypixel.vanityMeta.packages.includes("suit_treasure_boots"),
    } : {},
    seasonal: {
      events: func.getEvents(hypixel.seasonal),
      silver: hypixel.seasonal?.silver || 0,
    },
    totalDailyRewards: hypixel.totalDailyRewards || 0,
    dailyRewards: hypixel.rewardHighScore || 0,
    updated: Number(new Date()),
    tourney: hypixel.tourney || {}
  })
}
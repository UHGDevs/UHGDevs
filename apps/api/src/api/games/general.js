
const func = require('../../util/ApiFunctions');

module.exports = (hypixel = {} , uuid) => {
  const achievements = hypixel.achievements || {};
  return ({
    success: true,
    type: 'hypixel',
    _id: uuid,
    uuid: uuid,
    username: hypixel.displayname,
    rank: func.getRank(hypixel).rank,
    prefix: func.getRank(hypixel).prefix,
    color: func.getPlusColor(func.getRank(hypixel).rank, hypixel.rankPlusColor).hex,
    level: func.getNwLevel(hypixel.networkExp || 0),
    karma: hypixel.karma || 0,
    aps: hypixel.achievementPoints || 0,
    nicks: hypixel.knownAliases || {},
    links: hypixel.socialMedia ? hypixel.socialMedia.links || {} : {},
    fishing: {
      fish: achievements.general_master_lure || 0,
      junk: achievements.general_trashiest_diver || 0,
      treasure: achievements.general_luckiest_of_the_sea || 0,
    },
    ranksGiven:  hypixel.giftingMeta ? hypixel.giftingMeta.ranksGiven || 0 : 0,
    giftsGiven: hypixel.giftingMeta ? hypixel.giftingMeta.giftsGiven || 0 : 0,
    quests: achievements.general_quest_master || 0,
    challenges: achievements.general_challenger || 0,
    firstLogin: hypixel.firstLogin || -1,
    lastLogin: hypixel.lastLogin || -1,
    seasonal: hypixel.seasonal ? {
      summer: hypixel.seasonal.summer ? {
        experience: hypixel.seasonal.summer["2022"].levelling.experience || 0,
        level: (hypixel.seasonal.summer["2022"].levelling.experience || 0)/25000,
        xpleft: 25000-((hypixel.seasonal.summer["2022"].levelling.experience || 0)/25000-Math.floor((hypixel.seasonal.summer["2022"].levelling.experience || 0)/25000))*25000
      } : {},
      silver: hypixel.seasonal.silver || 0,
    } : {summer: {}},
    updated: Number(new Date())

  })
}

const constants = require('../../util/skyblockconstants')
const func = require('../../util/ApiFunctions');

module.exports = (player, profile, cache) => {
  
  let achievements = cache.cache.hypixel_achievements

  let skills = func.getSkills(player, achievements)

  let api = {
    username: player.username,
    uuid: player.uuid,
    updated: player.last_save,
    joined: player.first_join,

    skills_api: (!player.experience_skill_farming && !player.experience_skill_mining && !player.experience_skill_foraging) ? false : true,
    banking_api: profile.bank >= 0,
    purse_api: player.coin_purse ? true: false,

    bank: {
      purse: Math.floor(player.coin_purse || 0),
      bank: profile.bank > 0 ? profile.bank : 0,
      total: Math.floor(player.coin_purse || 0) + (profile.bank > 0 ? profile.bank : 0)
    },

    fairy_souls: {
      total: player.fairy_souls_collected || 0,
      unclaimed: player.fairy_souls || 0,
      boosted: player.fairy_exchanges || 0
    },

    cakes: (player.temp_stat_buffs || []).sort((a, b) => a.stat - b.stat),

    skills: skills.stats,
    skill_average: skills.sa,
    skill_average_progress: skills.tSa,

    essence: {
      undead: player.essence_undead || 0,
      wither: player.essence_wither || 0,
      spider: player.essence_spider || 0,
      ice: player.essence_ice || 0,
      gold: player.essence_gold || 0,
      diamond: player.essence_diamond || 0,
      dragon: player.essence_dragon || 0,
      crimson: player.essence_crimson || 0,
    },

  }
  return (api)
}
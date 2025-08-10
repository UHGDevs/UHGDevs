
const constants = require('../../util/skyblockconstants')
const func = require('../../util/ApiFunctions');

module.exports = (player, profile, cache) => {
  
  let achievements = cache.cache.hypixel_achievements

  let skills = func.getSkills(player, achievements)

  let mining = player.mining_core || {}
console.log(player.player_data.experience)
  console.log(Object.values(player.player_data.experience || [])?.filter(a => a>0))
  let api = {
    username: player.username,
    uuid: player.uuid,
    //updated: player.last_save,
    joined: player.profile.first_join,
    cookie: player.profile.cookie_buff_active ?? false,
    
    skills_api: Object.values(player.player_data.experience || [])?.filter(a => a>0).length ? true : false,
    banking_api: profile.bank >= 0,
    purse_api: player.currencies?.coin_purse >= 0,

    bank: {
      purse: Math.floor(player.currencies?.coin_purse ?? 0),
      bank: profile.bank ?? 0,
      total: Math.floor(player.currencies.coin_purse ?? 0) + (profile.bank ?? 0)
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

    collection: Object.keys(player.collection || {}).reduce((object, key) => {object[key.toLowerCase()] = player.collection[key]; return object}, {}),

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

    mining: {
      powder: (mining.powder_mithril || 0) + (mining.powder_spent_mithril || 0) + (mining.powder_gemstone || 0) + (mining.powder_spent_gemstone || 0),
      powder_mithril: (mining.powder_mithril || 0) + (mining.powder_spent_mithril || 0),
      powder_gemstone: (mining.powder_gemstone || 0) + (mining.powder_spent_gemstone || 0),
      hotm_xp: mining.experience || 0,
      hotm_tier: func.getHotmTier(mining.experience || 0),
      nucleus: mining.crystals && Object.values(mining.crystals).filter(n => n.total_placed).length === 5 ? Math.min(...Object.values(mining.crystals).filter(n => n.total_placed).map(n => n.total_placed ?? 0)) : 0,
      commissions: achievements.skyblock_hard_working_miner || 0,
      scatha: player.stats?.kills_scatha || 0,
    },

  }

  return (api)
}
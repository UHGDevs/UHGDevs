/**
 * src/api/skyblock/player.js
 */
const constants = require('../constants/skyblock');
const func = require('../ApiFunctions');

module.exports = (player, profile, extra = {}) => {
  // Achievements předáváme z Api.js, aby fungoval výpočet skillů pro API-OFF hráče
  const achievements = extra.achievements || {};

  // 1. SKILLS
  const skillsData = func.getSkills(player, achievements);

  // 2. MINING
  const miningData = player.mining_core || {};
  
  // 3. DUNGEONS
  const dungeonsData = player.dungeons || {};
  const cataExp = dungeonsData.dungeon_types?.catacombs?.experience || 0;
  
  // 4. SLAYERS
  const slayersData = func.getSlayers(player.slayer_bosses);

  // 5. PENÍZE (Bank + Purse)
  // Banka je v 'profile' objektu (protože je sdílená), Purse je v 'player' objektu
  const purse = player.coin_purse || 0;
  const bank = profile.banking ? (profile.banking.balance || 0) : 0;

  const api = {
    username: player.displayname, // Toto si doplní Api.js, ale pro jistotu
    uuid: player.uuid,
    last_save: player.last_save,
    first_join: player.first_join,

    // Status API
    skills_api: !!player.experience_skill_farming, // Jednoduchý check
    collections_api: !!player.collection,
    inventory_api: !!player.inv_contents,

    // Finance
    coins: {
        purse: Math.floor(purse),
        bank: Math.floor(bank),
        total: Math.floor(purse + bank)
    },

    // Skills
    skills: skillsData.stats,
    skill_average: skillsData.sa,
    skill_average_progress: skillsData.tSa, // True Average (s desetinami)

    // Dungeons
    dungeons: {
        level: Math.floor(func.getCataLvl(cataExp)),
        level_float: func.getCataLvl(cataExp),
        xp: cataExp,
        classes: dungeonsData.player_classes || {}
    },

    // Slayers
    slayers: slayersData,

    // Mining Core
    mining: {
      powder_mithril: (miningData.powder_mithril || 0) + (miningData.powder_spent_mithril || 0),
      powder_gemstone: (miningData.powder_gemstone || 0) + (miningData.powder_spent_gemstone || 0),
      hotm_tier: func.getHotmTier(miningData.experience || 0),
      hotm_xp: miningData.experience || 0,
      commissions: achievements.skyblock_hard_working_miner || 0,
    },

    // Fairy Souls
    fairy_souls: {
      collected: player.fairy_souls_collected || 0,
      unclaimed: player.fairy_souls || 0,
      total: (player.fairy_souls_collected || 0) + (player.fairy_souls || 0)
    },
    
    // Misc
    essence: {
        undead: player.essence_undead || 0,
        wither: player.essence_wither || 0,
        dragon: player.essence_dragon || 0,
        gold: player.essence_gold || 0,
        diamond: player.essence_diamond || 0,
        ice: player.essence_ice || 0,
        spider: player.essence_spider || 0,
        crimson: player.essence_crimson || 0
    }
  };

  return api;
};
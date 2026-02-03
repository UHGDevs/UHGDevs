/**
 * src/api/skyblock/player.js
 */
const func = require('../ApiFunctions');

module.exports = (profile, extra = {}) => {

  const player = profile.members[profile.uuid];
  const achievements = extra.achievements;

  const totalSocialExp = Object.values(profile.members).reduce((acc, m) => { return acc + (m.player_data?.experience?.SKILL_SOCIAL || 0) }, 0);
  if (!player.player_data.experience) player.player_data.experience = {};
  player.player_data.experience.SKILL_SOCIAL = totalSocialExp;


  const skills = func.getSkills(player, achievements || {})
  const mining = player?.mining_core || {}
  const dungeons = player?.dungeons || {}

  const api = {
    id: profile.profile_id,
    name: profile.cute_name,
    uuid: profile.uuid,
    mode: func.getSbMode(profile.game_mode),
    joined: player.profile.first_join || -1,
    selected: profile.selected || false,          

    //community_upgrades: p.community_upgrades || {}

    apis: {
      purse: player?.currencies?.coin_purse ? true: false,
      bank: profile?.banking?.balance >= 0,
      skill: !!player.player_data?.experience.SKILL_FARMING,
    },
    

    bank: {
      purse: Math.floor(player?.currencies?.coin_purse || 0),
      motes: Math.floor(player?.currencies?.motes_purse || 0),
      bank:  Math.floor(profile?.banking?.balance || 0),
      personal: Math.floor(player?.profile?.bank_account || 0),
      total: Math.floor((player?.currencies?.coin_purse || 0) + (profile?.banking?.balance || 0) + (player?.profile?.bank_account || 0)),
      networth: 0,
    },
    networth: {},

    fairy_souls: {
      total: player.fairy_soul.total_collected || 0,
      unclaimed: player.fairy_soul.unspent_souls || 0,
      boosted: player.fairy_soul.fairy_exchanges || 0
    },

    cakes: func.getCakes(player.player_data.temp_stat_buffs || []),

    skills: skills.stats,
    skill_average: skills.sa,
    skill_average_progress: skills.tSa,

    collection: Object.keys(player.collection || {}).reduce((object, key) => {object[key.toLowerCase()] = player.collection[key]; return object}, {}),

    essence: func.parseEssence(player?.currencies?.essence),

    mining: {
      powder: (mining.powder_mithril || 0) + (mining.powder_spent_mithril || 0) + (mining.powder_gemstone || 0) + (mining.powder_spent_gemstone || 0),
      powder_mithril: (mining.powder_mithril || 0) + (mining.powder_spent_mithril || 0),
      powder_gemstone: (mining.powder_gemstone || 0) + (mining.powder_spent_gemstone || 0),
      powder_glacite: (mining.powder_glacite || 0) + (mining.powder_spent_glacite || 0),
      hotm_xp: mining.experience || 0,
      hotm_tier: func.getHotmTier(mining.experience || 0),
      nucleus: player?.leveling?.completions?.NUCLEUS_RUNS || 0,
      commissions: achievements?.skyblock_hard_working_miner || undefined,
      scatha: (player?.player_stats?.kills?.scatha || 0) + (player?.player_stats?.kills?.scatha_10 || 0) || (player?.bestiary?.kills?.scatha || 0) + (player?.bestiary?.kills?.scatha_10 || 0),
      mineshafts: player?.glacite_player_data?.mineshafts_entered || 0,
    },

    dungeons: {
      secrets: dungeons?.secrets || 0,
      currentClass: dungeons?.selected_dungeon_class || "",
      lastRun: func.getFloorShort(dungeons.last_dungeon_run),
      level: func.f(func.getCataLvl(dungeons?.dungeon_types?.catacombs?.experience || 0), 2, true),
      runs: (dungeons?.dungeon_types?.catacombs?.tier_completions?.total || 0) + (dungeons?.dungeon_types?.master_catacombs?.tier_completions?.total || 0),
      secretsratio: func.ratio(dungeons?.secrets, (dungeons?.dungeon_types?.catacombs?.tier_completions?.total || 0) + (dungeons?.dungeon_types?.master_catacombs?.tier_completions?.total || 0)),
      mobkills: (dungeons?.dungeon_types?.catacombs?.mobs_killed?.total || 0) + (dungeons?.dungeon_types?.master_catacombs?.mobs_killed?.total || 0),
      classes: {
        healer: func.f(func.getCataLvl(dungeons?.player_classes?.healer?.experience), 2, true),
        mage: func.f(func.getCataLvl(dungeons?.player_classes?.mage?.experience), 2, true),
        berserk: func.f(func.getCataLvl(dungeons?.player_classes?.berserk?.experience), 2, true),
        archer: func.f(func.getCataLvl(dungeons?.player_classes?.archer?.experience), 2, true),
        tank: func.f(func.getCataLvl(dungeons?.player_classes?.tank?.experience), 2, true),
      },
      classavg: 0, // funguje - pod api upravuju
    },

    crimson: {
      fraction: player?.nether_island_player_data?.selected_faction || "Žádná",
      rep: player?.nether_island_player_data[`${player?.nether_island_player_data?.selected_faction || 'nic'}_reputation`] || 0,
      dojo: Object.entries(player?.nether_island_player_data?.dojo || {})?.reduce((acc, [key, val]) => key.includes('points') ? acc + val : acc, 0) || 0,
      kuudras: Object.entries(player?.nether_island_player_data?.kuudra_completed_tiers || {})?.reduce((acc, [key, val]) => !key.includes('highest') ? acc + val : acc, 0) || 0,
      trophies: player?.trophy_fish?.total_caught || 0,
    },

    end: {
      eyes: player?.player_data?.end_island?.summoning_eyes_collected || 0,
      eyes_placed: player?.player_data?.end_island?.summoning_eyes_contributed?.total || 0,
      drags: player?.player_data?.end_island?.dragon_fight?.amount_summoned.total || 0,
      soulflow: player?.item_data?.soulflow || 0
    },

    garden: {
      copper: player?.garden_player_data?.copper || 0,
    },

    slayers: func.getSlayers(player.slayer?.slayer_bosses),
  };

  api.dungeons.classavg = func.ratio((api.dungeons.classes.healer + api.dungeons.classes.mage + api.dungeons.classes.berserk + api.dungeons.classes.archer + api.dungeons.classes.tank), 5)

  return (api)
};
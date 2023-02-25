/* Export Functions */
//module.exports.getApi = getApi;

/* Import Functions & Packages */
const fetch = require('node-fetch');
const { skyblock_year_0 } = require('../settings/values/skyblockconstants.js');
/* Api Keys */
const api_key = process.env.api_key;
const api_key_2 = process.env.api_key_2;

/* Function getAPI */
module.exports = async (input, call=["mojang", "key", "hypixel"], skyblocki=[]) => {
  try {
  const uhg = await require("../index.js").uhg()
  const f = uhg.f
  const getSwLevel = uhg.getSwLevel
  const nwLevel = uhg.getNwLevel
  const getRank = uhg.getRank
  const getOnline = uhg.getOnline
  const getRankedPosition = uhg.getRankedPosition
  const ratio = uhg.ratio
  const toTime = uhg.toTime
  const getSwExpLeft = uhg.getSwExpLeft
  const getBwLevel = uhg.getBwLevel
  const getCataLvl = uhg.getCataLvl
  const romanize = uhg.romanize
  const getPlusColor = uhg.getPlusColor
  const getSlayerLvl = uhg.getSlayerLvl
  const getLevelByXp = uhg.getLevelByXp
  const getHotmTier = uhg.getHotmTier
  const getGamemode = uhg.getGamemode
  const getWwLevel = uhg.getWwLevel
  const getCrimson = uhg.getCrimson

  /* Empty dictionary */
  let api = {};
  let uuid = input;
  let nickname = input;
  let mojang = {};
  let hypixel = {};

  /* Volání mojang api */
  /* 600req/10min */
  if (call.includes("mojang")) {
    try {
      /* uuid / nickname */
      /*if (nickname.length > 20) {
        mojang = await fetch(`https://api.mojang.com/user/profiles/${nickname}/names`).then(mjg => mjg.json())
        if ("error" in mojang) return "Neplatné uuid"
        mojang = mojang[mojang.length-1]
      } else {
        let mjg = await fetch(`https://api.mojang.com/users/profiles/minecraft/${nickname}`)
        mojang = await mjg.json()
      }
      uuid = mojang.id || nickname
      nickname = mojang.name*/

      mojang = await fetch(`https://api.ashcon.app/mojang/v2/user/${nickname}`).then(mjg => mjg.json())
      if (mojang.code && uhg.data.verify) {
        let info = uhg.data.verify.filter(n => n.nickname.toLowerCase() == nickname.toLowerCase() || n.uuid.toLowerCase() == uuid.toLowerCase())
        let oldname;
        if (!info.length) oldname = uhg.data.verify.filter(n => { if (n.names && n.names.find(a => a.toLowerCase() == nickname.toLowerCase())) return true; return n.uuid.toLowerCase() == uuid.toLowerCase()})
        if (!info.length && oldname.length) {uuid = oldname[0].uuid; nickname = oldname[0].nickname} 
        else if (!info.length) return `${mojang.code}: ${mojang.error}`
        else {uuid = info[0].uuid; nickname = info[0].nickname} 
        mojang = {}
      } else if (mojang.code) return `${mojang.code}: ${mojang.error}`
      else {
        uuid = mojang.uuid || nickname
        uuid = uuid.replace(/-/g, "")
        nickname = mojang.username || nickname
      }
    } catch (e) {return "Neplatné minecraft jméno" }
  } else { if (nickname.length > 20) {uuid = nickname; nickname = null;} else return "UUID nenalezeno (kontaktuj developera)"}

  if (call.includes("key"||"api")) {
    var keylimit = await fetch(`https://api.hypixel.net/key?key=${api_key}`).then(api => api.json())
    var keylimit2 = await fetch(`https://api.hypixel.net/key?key=${api_key_2}`).then(api => api.json())
    if (keylimit.success == true) var apiuses = keylimit.record.queriesInPastMin
    else return `Chyba v API (${keylimit.cause || "key"})`;
    if (apiuses > 100) return `Přetížené API, počkej prosím chvíli! (${apiuses})`
    api.key = {
      uses: apiuses,
      totaluses: keylimit.record.totalQueries,
      uses2: keylimit2.record.queriesInPastMin,
      totaluses2: keylimit2.record.totalQueries
    }
  }

  if (call.includes("hypixel")) {
    hypixel = await fetch(`https://api.hypixel.net/player?key=${api_key_2}&uuid=${uuid}`).then(api => api.json())
    if (!hypixel.success) uhg.dc.cache.channels.get('bot').send(String(`${uuid} - ${hypixel.cause || "error"} | ${mojang.code || -1}: ${mojang.error || undefined} (${mojang.reason || undefined})`))
    if (!hypixel.success) return `Hypixel API: ${hypixel.cause || "error"}`
    if (!hypixel.player) return "Hráč nikdy nebyl na hypixelu"
    if (!hypixel.player.stats || false) return "Hráč nehrál žádnou minihru"

    var currenttourney = "gingerbread_solo_1" //  ! CURRENT TOURNAMENT !

    hypixel = hypixel.player
    var achievements = hypixel.achievements || {}
    var skywars = hypixel.stats.SkyWars || {}
    var bedwars = hypixel.stats.Bedwars || {}
    var arena = hypixel.stats.Arena || {}
    var murder = hypixel.stats.MurderMystery || {}
    var arcade = hypixel.stats.Arcade || {}
    var tkr = hypixel.stats.GingerBread || {}
    var pit = hypixel.stats.Pit || {}
    var walls = hypixel.stats.Walls || {}
    var quake = hypixel.stats.Quake || {}
    var vampirez = hypixel.stats.VampireZ || {}
    var bb = hypixel.stats.BuildBattle || {}
    var uhc = hypixel.stats.UHC || {}
    var speeduhc = hypixel.stats.SpeedUHC || {}
    var duels = hypixel.stats.Duels || {}
    var tnt = hypixel.stats.TNTGames || {}
    var pb = hypixel.stats.Paintball || {}
    var cac = hypixel.stats.MCGO || {}
    var blitz = hypixel.stats.HungerGames || {}
    var mw = hypixel.stats.Walls3 || {}
    var smash = hypixel.stats.SuperSmash || {}
    var warlords = hypixel.stats.Battleground || {}
    var ww = hypixel.stats.WoolGames || {}
    var cw = hypixel.stats.TrueCombat || {}
    var skyclash = hypixel.stats.SkyClash || {}
    var legacy = hypixel.stats.Legacy || {}
    //var ww = hypixel.stats.WoolGames || {wool_wars: {layouts: {}, stats: {classes: {engineer: {}, golem: {}, tank: {}, swordsman: {}, assualt: {}, archer: {}}}}, progression: {}}
    var tourney = hypixel.tourney || {}
    var ctourney = tourney[currenttourney] || {}

    var skyblocksecrets = achievements.skyblock_treasure_hunter || 0

    let wwexpand = ww.wool_wars || {}
    let wwstats = wwexpand.stats || {}
    let wwprogress = ww.progression || {}
    let wwclasses = wwstats.classes || {archer: {}, assault: {}, swordsman: {}, tank: {}, golem: {}, engineer: {}}

    let swrating = {null: 0}
    let swposition = {null: "unknown"}
    Object.keys(skywars).forEach(n=>{
      if (n.includes("_skywars_rating_") && n.endsWith("rating")) swrating[n] = skywars[n]
      if (n.includes("_skywars_rating_") && n.endsWith("position")) swposition[n] = skywars[n]
    })
    let swhighestpos = Object.entries(swposition).reduce((a, b) => a[1] < b[1] ? a : b)[0] || 0
    let swhighestrt = Object.entries(swrating).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 0

    let abrating = {null: 0}
    let abposition = {null: "unknown"}
    Object.keys(arena).forEach(n=>{
      if (n.includes("_arena_rating_") && n.endsWith("rating")) abrating[n] = arena[n]
      if (n.includes("_arena_rating_") && n.endsWith("position")) abposition[n] = arena[n]
    })
    let abhighestpos = Object.entries(abposition).reduce((a, b) => a[1] < b[1] ? a : b)[0] || 0
    let abhighestrt = Object.entries(abrating).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 0

    let tkrrating = {null: 0}
    let tkrposition = {null: "unknown"}
    Object.keys(tkr).forEach(n=>{
      if (n.startsWith("GingerBread_tkr_points_") && n.endsWith("points")) tkrrating[n] = tkr[n]
      if (n.startsWith("GingerBread_tkr_points_") && n.endsWith("position")) tkrposition[n] = tkr[n]
    })
    let tkrhighestpos = Object.entries(tkrposition).reduce((a, b) => a[1] < b[1] ? a : b)[0] || 0
    let tkrhighestrt = Object.entries(tkrrating).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 0

    const modes = {
      skywars: {
        skywars_solo_normal: skywars.wins_solo_normal || 0,
        skywars_solo_insane: skywars.wins_solo_insane || 0,
        skywars_teams_normal: skywars.wins_team_normal || 0,
        skywars_teams_insane: skywars.wins_team_insane || 0,
        skywars_ranked: skywars.wins_ranked || 0,
        skywars_normalmega: skywars.wins_mega || 0,
        skywars_doublesmega: skywars.wins_mega_doubles || 0,
        skywars_lab: skywars.wins_lab || 0,
      },
      bedwars: {
        bedwars_four_three: bedwars.four_three_games_played_bedwars || 0,
        bedwars_eight_two: bedwars.eight_two_games_played_bedwars || 0,
        bedwars_eight_one: bedwars.eight_one_games_played_bedwars || 0,
        bedwars_four_four: bedwars.four_four_games_played_bedwars || 0,
        bedwars_two_four: bedwars.two_four_games_played_bedwars || 0,
        bedwars_castle: bedwars.castle_games_played_bedwars || 0,
        bedwars_four_four_armed: bedwars.four_four_armed_games_played_bedwars || 0,
        bedwars_eight_two_armed: bedwars.eight_two_armed_games_played_bedwars || 0,
        bedwars_four_four_voidless: bedwars.four_four_voidless_games_played_bedwars || 0,
        bedwars_eight_two_voidless: bedwars.eight_two_voidless_games_played_bedwars || 0,
        bedwars_four_four_lucky: bedwars.four_four_lucky_games_played_bedwars || 0,
        bedwars_eight_two_lucky: bedwars.eight_two_lucky_games_played_bedwars || 0,
        bedwars_eight_two_ultimate: bedwars.eight_two_ultimate_games_played_bedwars || 0,
        bedwars_four_four_ultimate: bedwars.four_four_ultimate_games_played_bedwars || 0,
        bedwars_four_four_rush: bedwars.four_four_rush_games_played_bedwars || 0,
        bedwars_eight_two_rush: bedwars.eight_two_rush_games_played_bedwars || 0,
      },
      murder: {
        murder_classic: murder.games_MURDER_CLASSIC || 0,
        murder_double_up: murder.games_MURDER_DOUBLE_UP || 0,
        murder_showdown: murder.games_MURDER_SHOWDOWN || 0,
        murder_infection: murder.games_MURDER_INFECTION || 0,
        murder_hardcore: murder.games_MURDER_HARDCORE || 0,
        murder_assassins: murder.games_MURDER_ASSASSINS || 0,
      }
    }

    let color = getPlusColor(getRank(hypixel).rank, hypixel.rankPlusColor).hex
    if (getRank(hypixel).rank == 'YOUTUBE') {color = [getPlusColor(getRank(hypixel).rank, hypixel.rankPlusColor).hex, getPlusColor(getRank(hypixel).rank, hypixel.rankPlusColor).hex2]}
    api.hypixel = {
      _id: uuid,
      username: hypixel.displayname,
      uuid: uuid,
      rank: getRank(hypixel).rank,
      prefix: getRank(hypixel).prefix,
      color: color,
      level: nwLevel(hypixel.networkExp || 0),
      karma: hypixel.karma || 0,
      aps: hypixel.achievementPoints || 0,
      legacyAps: await require('./achievements').countPoints(uhg.aps.legacy, hypixel.achievementsOneTime, achievements),
      nicks: hypixel.knownAliases || {},
      links: hypixel.socialMedia ? hypixel.socialMedia.links || {} : {},
      userLanguage: hypixel.userLanguage || "ENGLISH",
      fishing: {
        fish: achievements.general_master_lure || 0,
        junk: achievements.general_trashiest_diver || 0,
        treasure: achievements.general_luckiest_of_the_sea || 0,
      },
      ranksGiven: hypixel.giftingMeta ? hypixel.giftingMeta.ranksGiven || 0 : 0,
      giftsGiven: hypixel.giftingMeta ? hypixel.giftingMeta.giftsGiven || 0 : 0,
      quests: achievements.general_quest_master || 0,
      challenges: achievements.general_challenger || 0,
      legacyTokens: legacy.total_tokens || 0,
      stats: {},
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
      updated: Number(new Date()),
    }

    let arcadewins = (arcade.wins_party || 0)+(arcade.wins_dayone || 0)+(arcade.wins_oneinthequiver || 0)+(arcade.wins_dragonwars2 || 0)+(arcade.wins_ender || 0)+(arcade.wins_farm_hunt || 0)+(arcade.wins_soccer || 0)+(arcade.sw_game_wins || 0)+(arcade.hider_wins_hide_and_seek || 0)+(arcade.seeker_wins_hide_and_seek || 0)+(arcade.wins_hole_in_the_wall || 0)+(arcade.wins_simon_says || 0)+(arcade.wins_mini_walls || 0)+(arcade.wins_draw_their_thing || 0)+(arcade.wins_throw_out || 0)+(arcade.wins_zombies || 0)+(arcade.wins_scuba_simulator || 0)+(arcade.wins_easter_simulator || 0)+(arcade.wins_halloween_simulator || 0)+(arcade.wins_grinch_simulator_v2 || 0)
    let arcadewinsfinal = arcadewins > (achievements.arcade_arcade_winner || 0) ? arcadewins : achievements.arcade_arcade_winner || 0
    api.hypixel.stats.wins = {
      total: arcadewinsfinal+(wwstats.wins || 0)+(skywars.wins || 0)+(bedwars.wins_bedwars || 0)+(duels.wins || 0)+(murder.wins || 0)+(bb.wins || 0)+(achievements.uhc_champion || 0)+(speeduhc.wins || 0)+(tnt.wins || 0)+(vampirez.human_wins || 0)+(vampirez.vampire_wins || 0)+(quake.wins || 0)+(quake.wins_teams || 0)+(pb.wins || 0)+(tkr.gold_trophy || 0)+(walls.wins || 0)+(arena.wins || 0)+(cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(blitz.wins || 0)+(blitz.wins_teams || 0)+(mw.wins || 0)+(smash.wins || 0)+(warlords.wins || 0)+(wwstats.wins || 0)+(cw.wins || 0)+(skyclash.wins || 0),
      minigames: {
        skywars: skywars.wins || 0,
        bedwars: bedwars.wins_bedwars || 0,
        arcade: arcadewinsfinal,
        duels: duels.wins || 0,
        murder: murder.wins || 0,
        buildbattle: bb.wins || 0,
        uhc: achievements.uhc_champion || 0,
        speeduhc: speeduhc.wins || 0,
        tntgames: tnt.wins || 0,
        vampirez: (vampirez.human_wins || 0)+(vampirez.vampire_wins || 0),
        quake: (quake.wins || 0)+(quake.wins_teams || 0),
        paintball: pb.wins || 0,
        tkr: tkr.gold_trophy || 0,
        thewalls: walls.wins || 0,
        arena: arena.wins || 0,
        cac: (cac.game_wins_deathmatch || 0)+(cac.game_wins || 0),
        blitz: (blitz.wins || 0)+(blitz.wins_teams || 0),
        megawalls: mw.wins || 0,
        smashheroes: smash.wins || 0,
        warlords: warlords.wins || 0,
        woolwars: wwstats.wins || 0,
        crazywalls: cw.wins || 0,
        skyclash: skyclash.wins || 0,
      },
    }

    let sw_main_mode = Object.entries(modes.skywars).reduce((a, b) => a[1] > b[1] ? a : b)[0]

    api.hypixel.stats.skywars = {
      levelformatted: uhg.clear(skywars.levelFormatted || "1⋆"),
      level: getSwLevel(skywars.skywars_experience || 0),
      coins: skywars.coins || 0,
      souls: skywars.souls || 0,
      shards: skywars.shard || 0,
      shardsp: f((skywars.shard || 0) / 200, "", 2),
      heads: skywars.heads || 0,
      tokens: skywars.cosmetic_tokens || 0,
      opals: skywars.opals || 0,
      expmilestone: getSwExpLeft(skywars.skywars_experience || 0),
      playtime: toTime(skywars.time_played || 0).h,
      main_mode: getGamemode(sw_main_mode),
      overall: {
        wins: skywars.wins || 0,
        losses: skywars.losses || 0,
        wlr: ratio(skywars.wins, skywars.losses),
        games: skywars.games_played_skywars || 0,
        kills: skywars.kills || 0,
        deaths: skywars.deaths || 0,
        kdr: ratio(skywars.kills, skywars.deaths),
        playtime: toTime(skywars.time_played || 0).formatted,
        rawplaytime: skywars.time_played || 0,
        assists: skywars.assists || 0
      },
      solo_normal: {
        wins: skywars.wins_solo_normal || 0,
        losses: skywars.losses_solo_normal || 0,
        wlr: ratio(skywars.wins_solo_normal, skywars.losses_solo_normal),
        kills: skywars.kills_solo_normal || 0,
        deaths: skywars.deaths_solo_normal || 0,
        kdr: ratio(skywars.kills_solo_normal, skywars.deaths_solo_normal),
        games: skywars.games_solo || 0,
        playtime: toTime(skywars.time_played_solo || 0).formatted,
        rawplaytime: skywars.time_played_solo || 0,
        assists: skywars.assists_solo || 0
      },
      solo_insane: {
        wins: skywars.wins_solo_insane || 0,
        losses: skywars.losses_solo_insane || 0,
        wlr: ratio(skywars.wins_solo_insane, skywars.losses_solo_insane),
        kills: skywars.kills_solo_insane || 0,
        deaths: skywars.deaths_solo_insane || 0,
        kdr: ratio(skywars.kills_solo_insane, skywars.deaths_solo_insane),
        games: skywars.games_solo || 0,
        playtime: toTime(skywars.time_played_solo || 0).formatted,
        rawplaytime: skywars.time_played_solo || 0,
        assists: skywars.assists_solo || 0
      },
      team_normal: {
        wins: skywars.wins_team_normal || 0,
        losses: skywars.losses_team_normal || 0,
        wlr: ratio(skywars.wins_team_normal, skywars.losses_team_normal),
        kills: skywars.kills_team_normal || 0,
        deaths: skywars.deaths_team_normal || 0,
        kdr: ratio(skywars.kills_team_normal, skywars.deaths_team_normal),
        games: skywars.games_team || 0,
        playtime: toTime(skywars.time_played_team || 0).formatted,
        rawplaytime: skywars.time_played_team || 0,
        assists: skywars.assists_team || 0
      },
      team_insane: {
        wins: skywars.wins_team_insane || 0,
        losses: skywars.losses_team_insane || 0,
        wlr: ratio(skywars.wins_team_insane, skywars.losses_team_insane),
        kills: skywars.kills_team_insane || 0,
        deaths: skywars.deaths_team_insane || 0,
        kdr: ratio(skywars.kills_team_insane, skywars.deaths_team_insane),
        games: skywars.games_team || 0,
        playtime: toTime(skywars.time_played_team || 0).formatted,
        rawplaytime: skywars.time_played_team || 0,
        assists: skywars.assists_team || 0
      },
      ranked: {
        wins: skywars.wins_ranked || 0,
        losses: skywars.losses_ranked || 0,
        wlr: ratio(skywars.wins_ranked, skywars.losses_ranked),
        kills: skywars.kills_ranked || 0,
        deaths: skywars.deaths_ranked || 0,
        kdr: ratio(skywars.kills_ranked, skywars.deaths_ranked),
        games: skywars.games_ranked || 0,
        playtime: toTime(skywars.time_played_ranked || 0).formatted,
        rawplaytime: skywars.time_played_ranked || 0,
        assists: skywars.assists_ranked || 0,
        rating: swrating || 0,
        position: swposition || 0,
        highestrt: swrating[swhighestrt] || 0,
        highestpos: swposition[swhighestpos] || null,
      }
    }

    let bw_main_mode = Object.entries(modes.bedwars).reduce((a, b) => a[1] > b[1] ? a : b)[0]

    api.hypixel.stats.bedwars = {
      level: getBwLevel(bedwars.Experience),
      levelformatted: `[${Math.floor(getBwLevel(bedwars.Experience))}☆]`,
      xp: bedwars.Experience || 0,
      coins: bedwars.coins || 0,
      main_mode: getGamemode(bw_main_mode),
      challenges: bedwars.total_challenges_completed || 0,
      uniquechallenges: bedwars.bw_unique_challenges_completed || 0,
      overall: {
          games: bedwars.games_played_bedwars || 0,
          winstreak: bedwars.winstreak || 0,
          wins: bedwars.wins_bedwars || 0,
          losses: bedwars.losses_bedwars || 0,
          wlr: ratio(bedwars.wins_bedwars, bedwars.losses_bedwars, 2),
          finalKills: bedwars.final_kills_bedwars || 0,
          finalDeaths: bedwars.final_deaths_bedwars || 0,
          fkdr: ratio(bedwars.final_kills_bedwars, bedwars.final_deaths_bedwars),
          kills: bedwars.kills_bedwars || 0,
          deaths: bedwars.deaths_bedwars || 0,
          kdr: ratio(bedwars.kills_bedwars, bedwars.deaths_bedwars),
          bedsBroken: bedwars.beds_broken_bedwars || 0,
          bedsLost: bedwars.beds_lost_bedwars || 0,
          bblr: ratio(bedwars.beds_broken_bedwars, bedwars.beds_lost_bedwars),
          iron: bedwars.iron_resources_collected_bedwars || 0,
          gold: bedwars.gold_resources_collected_bedwars || 0,
          diamond: bedwars.diamond_resources_collected_bedwars || 0,
          emerald: bedwars.emerald_resources_collected_bedwars || 0
      },
      solo: {
          games: bedwars.eight_one_games_played_bedwars || 0,
          winstreak: bedwars.eight_one_winstreak || 0,
          wins: bedwars.eight_one_wins_bedwars || 0,
          losses: bedwars.eight_one_losses_bedwars || 0,
          wlr: ratio(bedwars.eight_one_wins_bedwars, bedwars.eight_one_losses_bedwars),
          finalKills: bedwars.eight_one_final_kills_bedwars || 0,
          finalDeaths: bedwars.eight_one_final_deaths_bedwars || 0,
          fkdr: ratio(bedwars.eight_one_final_kills_bedwars, bedwars.eight_one_final_deaths_bedwars),
          kills: bedwars.eight_one_kills_bedwars || 0,
          deaths: bedwars.eight_one_deaths_bedwars || 0,
          kdr: ratio(bedwars.eight_one_kills_bedwars, bedwars.eight_one_deaths_bedwars),
          bedsBroken: bedwars.eight_one_beds_broken_bedwars || 0,
          bedsLost: bedwars.eight_one_beds_lost_bedwars || 0,
          bblr: ratio(bedwars.eight_one_beds_broken_bedwars, bedwars.eight_one_beds_lost_bedwars),
          iron: bedwars.eight_one_iron_resources_collected_bedwars || 0,
          gold: bedwars.eight_one_gold_resources_collected_bedwars || 0,
          diamond: bedwars.eight_one_diamond_resources_collected_bedwars || 0,
          emerald: bedwars.eight_one_emerald_resources_collected_bedwars || 0
      },
      doubles: {
          games: bedwars.eight_two_games_played_bedwars || 0,
          winstreak: bedwars.eight_two_winstreak || 0,
          wins: bedwars.eight_two_wins_bedwars || 0,
          losses: bedwars.eight_two_losses_bedwars || 0,
          wlr: ratio(bedwars.eight_two_wins_bedwars, bedwars.eight_two_losses_bedwars),
          finalKills: bedwars.eight_two_final_kills_bedwars || 0,
          finalDeaths: bedwars.eight_two_final_deaths_bedwars || 0,
          fkdr: ratio(bedwars.eight_two_final_kills_bedwars, bedwars.eight_two_final_deaths_bedwars),
          kills: bedwars.eight_two_kills_bedwars || 0,
          deaths: bedwars.eight_two_deaths_bedwars || 0,
          kdr: ratio(bedwars.eight_two_kills_bedwars, bedwars.eight_two_deaths_bedwars),
          bedsBroken: bedwars.eight_two_beds_broken_bedwars || 0,
          bedsLost: bedwars.eight_two_beds_lost_bedwars || 0,
          bblr: ratio(bedwars.eight_two_beds_broken_bedwars, bedwars.eight_two_beds_lost_bedwars),
          iron: bedwars.eight_two_iron_resources_collected_bedwars || 0,
          gold: bedwars.eight_two_gold_resources_collected_bedwars || 0,
          diamond: bedwars.eight_two_diamond_resources_collected_bedwars || 0,
          emerald: bedwars.eight_two_emerald_resources_collected_bedwars || 0
      },
      threes: {
          games: bedwars.four_three_games_played_bedwars || 0,
          winstreak: bedwars.four_three_winstreak || 0,
          wins: bedwars.four_three_wins_bedwars || 0,
          losses: bedwars.four_three_losses_bedwars || 0,
          wlr: ratio(bedwars.four_three_wins_bedwars, bedwars.four_three_losses_bedwars),
          finalKills: bedwars.four_three_final_kills_bedwars || 0,
          finalDeaths: bedwars.four_three_final_deaths_bedwars || 0,
          fkdr: ratio(bedwars.four_three_final_kills_bedwars, bedwars.four_three_final_deaths_bedwars),
          kills: bedwars.four_three_kills_bedwars || 0,
          deaths: bedwars.four_three_deaths_bedwars || 0,
          kdr: ratio(bedwars.four_three_kills_bedwars, bedwars.four_three_deaths_bedwars),
          bedsBroken: bedwars.four_three_beds_broken_bedwars || 0,
          bedsLost: bedwars.four_three_beds_lost_bedwars || 0,
          bblr: ratio(bedwars.four_three_beds_broken_bedwars, bedwars.four_three_beds_lost_bedwars),
          iron: bedwars.four_three_iron_resources_collected_bedwars || 0,
          gold: bedwars.four_three_gold_resources_collected_bedwars || 0,
          diamond: bedwars.four_three_diamond_resources_collected_bedwars || 0,
          emerald: bedwars.four_three_emerald_resources_collected_bedwars || 0
      },
      fours: {
          games: bedwars.four_four_games_played_bedwars || 0,
          winstreak: bedwars.four_four_winstreak || 0,
          wins: bedwars.four_four_wins_bedwars || 0,
          losses: bedwars.four_four_losses_bedwars || 0,
          wlr: ratio(bedwars.four_four_wins_bedwars, bedwars.four_four_losses_bedwars),
          finalKills: bedwars.four_four_final_kills_bedwars || 0,
          finalDeaths: bedwars.four_four_final_deaths_bedwars || 0,
          fkdr: ratio(bedwars.four_four_final_kills_bedwars, bedwars.four_four_final_deaths_bedwars),
          kills: bedwars.four_four_kills_bedwars || 0,
          deaths: bedwars.four_four_deaths_bedwars || 0,
          kdr: ratio(bedwars.four_four_kills_bedwars, bedwars.four_four_deaths_bedwars),
          bedsBroken: bedwars.four_four_beds_broken_bedwars || 0,
          bedsLost: bedwars.four_four_beds_lost_bedwars || 0,
          bblr: ratio(bedwars.four_four_beds_broken_bedwars, bedwars.four_four_beds_lost_bedwars),
          iron: bedwars.four_four_iron_resources_collected_bedwars || 0,
          gold: bedwars.four_four_gold_resources_collected_bedwars || 0,
          diamond: bedwars.four_four_diamond_resources_collected_bedwars || 0,
          emerald: bedwars.four_four_emerald_resources_collected_bedwars || 0
      },
      "4v4": {
          games: bedwars.two_four_games_played_bedwars || 0,
          winstreak: bedwars.two_four_winstreak || 0,
          wins: bedwars.two_four_wins_bedwars || 0,
          losses: bedwars.two_four_losses_bedwars || 0,
          wlr: ratio(bedwars.two_four_wins_bedwars, bedwars.two_four_losses_bedwars),
          finalKills: bedwars.two_four_final_kills_bedwars || 0,
          finalDeaths: bedwars.two_four_final_deaths_bedwars || 0,
          fkdr: ratio(bedwars.two_four_final_kills_bedwars, bedwars.two_four_final_deaths_bedwars),
          kills: bedwars.two_four_kills_bedwars || 0,
          deaths: bedwars.two_four_deaths_bedwars || 0,
          kdr: ratio(bedwars.two_four_kills_bedwars, bedwars.two_four_deaths_bedwars),
          bedsBroken: bedwars.two_four_beds_broken_bedwars || 0,
          bedsLost: bedwars.two_four_beds_lost_bedwars || 0,
          bblr: ratio(bedwars.two_four_beds_broken_bedwars, bedwars.two_four_beds_lost_bedwars),
          iron: bedwars.two_four_iron_resources_collected_bedwars || 0,
          gold: bedwars.two_four_gold_resources_collected_bedwars || 0,
          diamond: bedwars.two_four_diamond_resources_collected_bedwars || 0,
          emerald: bedwars.two_four_emerald_resources_collected_bedwars || 0
      }
  }

  var overall_arena_losses = (arena.losses_1v1 || 0) + (arena.losses_2v2 || 0) + (arena.losses_4v4 || 0)
  var overall_arena_kills = (arena.kills_1v1 || 0) + (arena.kills_2v2 || 0) + (arena.kills_4v4 || 0)
  var overall_arena_deaths = (arena.deaths_1v1 || 0) + (arena.deaths_2v2 || 0) + (arena.deaths_4v4 || 0)
  var overall_arena_winstreak = (arena.win_streaks_1v1 || 0) + (arena.win_streaks_2v2 || 0) + (arena.win_streaks_4v4 || 0)

  api.hypixel.stats.arena = {
      coins: arena.coins || 0,
      keys: arena.keys || 0,
      chestused: arena.magical_chest || 0,
      offensive: arena.offensive || "Fireball",
      utility: arena.utility || "Bull Charge",
      support: arena.support || "Holy Water",
      ultimate: arena.ultimate || "Shield Wall",
      rune: arena.active_rune || "No",
      rating: abrating || 0,
      position: abposition || 0,
      highestrt: abrating[abhighestrt] || 0,
      highestpos: abposition[abhighestpos] || null,
      rune_levels: {
          damage: arena.rune_level_damage || 0,
          tank: arena.rune_level_tank || 0,
          energy: arena.rune_level_energy || 0,
          speed: arena.rune_level_speed || 0,
          slowing: arena.rune_level_slowing || 0,
      },
      upgrades: {
          cooldown: arena.lvl_cooldown || 0,
          health: arena.lvl_health || 0,
          energy: arena.lvl_energy || 0,
          damage: arena.lvl_damage || 0,
      },

      overall: {
          wins: arena.wins || 0,
          losses: overall_arena_losses,
          wlr: ratio(arena.wins, overall_arena_losses) || 0,
          kills: overall_arena_kills,
          deaths: overall_arena_deaths,
          kdr: ratio(overall_arena_kills, overall_arena_deaths) || 0,
          winstreak: overall_arena_winstreak,
      },
      solo: {
          wins: arena.wins_1v1 || 0,
          losses: arena.losses_1v1 || 0,
          winstreak: arena.win_streaks_1v1 || 0,
          wlr: ratio(arena.wins_1v1, arena.losses_1v1) || 0,
          kills: arena.kills_1v1 || 0,
          deaths: arena.deaths_1v1 || 0,
          kdr: ratio(arena.kills_1v1, arena.deaths_1v1) || 0,
      },
      doubles: {
          wins: arena.wins_2v2 || 0,
          losses: arena.losses_2v2 || 0,
          winstreak: arena.win_streaks_2v2 || 0,
          wlr: ratio(arena.wins_2v2, arena.losses_2v2) || 0,
          kills: arena.kills_2v2 || 0,
          deaths: arena.deaths_2v2 || 0,
          kdr: ratio(arena.kills_2v2, arena.deaths_2v2) || 0,
      },
      fours: {
          wins: arena.wins_4v4 || 0,
          losses: arena.losses_4v4 || 0,
          winstreak: arena.win_streaks_4v4 || 0,
          wlr: ratio(arena.wins_4v4, arena.losses_4v4) || 0,
          kills: arena.kills_4v4 || 0,
          deaths: arena.deaths_4v4 || 0,
          kdr: ratio(arena.kills_4v4, arena.deaths_4v4) || 0,
      }
    }

    let murder_main_mode = Object.entries(modes.murder).reduce((a, b) => a[1] > b[1] ? a : b)[0]

    api.hypixel.stats.murder = {
      coins: murder.coins || 0,
      murdererwins: murder.murderer_wins || 0,
      detectivewins: murder.detective_wins || 0,
      herowins: murder.was_hero || 0,
      main_mode: getGamemode(murder_main_mode),
      overall: {
        games: murder.games || 0,
        wins: murder.wins || 0,
        kills: murder.kills || 0,
        losses: murder.games-murder.wins || 0,
        deaths: murder.deaths || 0,
        wlr: ratio(murder.wins, murder.games-murder.wins) || 0,
        kdr: ratio(murder.kills, murder.deaths) || 0,
      },
      classic: {
        games: murder.games_MURDER_CLASSIC || 0,
        wins: murder.wins_MURDER_CLASSIC || 0,
        kills: murder.kills_MURDER_CLASSIC || 0,
        losses: murder.games_MURDER_CLASSIC-murder.wins_MURDER_CLASSIC || 0,
        deaths: murder.deaths_MURDER_CLASSIC || 0,
        wlr: ratio(murder.wins_MURDER_CLASSIC, murder.games_MURDER_CLASSIC-murder.wins_MURDER_CLASSIC) || 0,
        kdr: ratio(murder.kills_MURDER_CLASSIC, murder.deaths_MURDER_CLASSIC) || 0,
      },
      doubleup: {
        games: murder.games_MURDER_DOUBLE_UP || 0,
        wins: murder.wins_MURDER_DOUBLE_UP || 0,
        kills: murder.kills_MURDER_DOUBLE_UP || 0,
        losses: murder.games_MURDER_DOUBLE_UP-murder.wins_MURDER_DOUBLE_UP || 0,
        deaths: murder.deaths_MURDER_DOUBLE_UP || 0,
        wlr: ratio(murder.wins_MURDER_DOUBLE_UP, murder.games_MURDER_DOUBLE_UP-murder.wins_MURDER_DOUBLE_UP) || 0,
        kdr: ratio(murder.kills_MURDER_DOUBLE_UP, murder.deaths_MURDER_DOUBLE_UP) || 0,
      },
      assassins: {
        games: murder.games_MURDER_ASSASSINS || 0,
        wins: murder.wins_MURDER_ASSASSINS || 0,
        kills: murder.kills_MURDER_ASSASSINS || 0,
        losses: murder.games_MURDER_ASSASSINS-murder.wins_MURDER_ASSASSINS || 0,
        deaths: murder.deaths_MURDER_ASSASSINS || 0,
        wlr: ratio(murder.wins_MURDER_ASSASSINS, murder.games_MURDER_ASSASSINS-murder.wins_MURDER_ASSASSINS) || 0,
        kdr: ratio(murder.kills_MURDER_ASSASSINS, murder.deaths_MURDER_ASSASSINS) || 0,
      },
      infection: {
        games: murder.games_MURDER_INFECTION || 0,
        wins: murder.wins_MURDER_INFECTION || 0,
        survivorwins: murder.survivor_wins_MURDER_INFECTION || 0,
        kills: murder.kills_MURDER_INFECTION || 0,
        losses: murder.games_MURDER_INFECTION-murder.wins_MURDER_INFECTION || 0,
        deaths: murder.deaths_MURDER_INFECTION || 0,
        wlr: ratio(murder.wins_MURDER_INFECTION, murder.games_MURDER_INFECTION-murder.wins_MURDER_INFECTION) || 0,
        kdr: ratio(murder.kills_MURDER_INFECTION, murder.deaths_MURDER_INFECTION) || 0,
      }
    }

    api.hypixel.stats.arcade = {
      coins: arcade.coins || 0,
      holeinthewall: {
        wins: arcade.wins_hole_in_the_wall || 0,
        rounds: arcade.rounds_hole_in_the_wall || 0,
        qscore: arcade.hitw_record_q || 0,
        fscore: arcade.hitw_record_f || 0,
      },
      partygames: {
        wins: arcade.wins_party || 0,
        rounds: arcade.round_wins_party || 0,
        stars: arcade.total_stars_party || 0,
      },
      football: {
        wins: arcade.wins_soccer || 0,
        goals: arcade.goals_soccer || 0,
      },
      blockingdead: {
        wins: arcade.wins_dayone || 0,
        kills: arcade.kills_dayone || 0,
        headshots: arcade.headshots_dayone || 0,
      },
      bountyhunters: {
        wins: arcade.wins_oneinthequiver || 0,
        kills: arcade.kills_oneinthequiver || 0,
        deaths: arcade.deaths_oneinthequiver || 0,
        kdr: ratio(arcade.kills_oneinthequiver, arcade.deaths_oneinthequiver) || 0,
        bountykills: arcade.bounty_kills_oneinthequiver || 0,
        bowkills: arcade.bow_kills_oneinthequiver || 0,
        swordkills: arcade.sword_kills_oneinthequiver || 0,
      },
      capturethewool: {
        killsassists: achievements.arcade_ctw_slayer || 0,
        capturedwools: achievements.arcade_ctw_oh_sheep || 0,
      },
      creeperattack: {
        bestround: arcade.max_wave || 0,
      },
      dragonwars: {
        wins: arcade.wins_dragonwars2 || 0,
        kills: arcade.kills_dragonwars2 || 0,
      },
      enderspleef: {
        wins: arcade.wins_ender || 0,
        trail: arcade.enderspleef_trail || "None",
      },
      farmhunt: {
        wins: arcade.wins_farm_hunt || 0,
        kills: arcade.kills_farm_hunt || 0,
        animalwins: arcade.animal_wins_farm_hunt || 0,
        hunterwins: arcade.hunter_wins_farm_hunt || 0,
        bowkills: arcade.bow_kills_farm_hunt || 0,
        hunterkills: arcade.hunter_kills_farm_hunt || 0,
        animalkills: arcade.animal_kills_farm_hunt || 0,
        poop: arcade.poop_collected_farm_hunt || 0,
        taunts: {
          dangerous: arcade.dangerous_taunts_used_farm_hunt || 0,
          firework: arcade.firework_taunts_used_farm_hunt || 0,
          risky: arcade.risky_taunts_used_farm_hunt || 0,
          safe: arcade.safe_taunts_used_farm_hunt || 0,
          taunts: arcade.taunts_used_farm_hunt || 0,
        },
      },
      galaxywars: {
        wins: arcade.sw_game_wins || 0,
        kills: arcade.sw_kills || 0,
        deaths: arcade.sw_deaths || 0,
        kdr: ratio(arcade.sw_kills, arcade.sw_deaths) || 0,
        rebelkills: arcade.sw_rebel_kills || 0,
        empirekills: arcade.sw_empire_kills || 0,
        shotsfired: arcade.sw_shots_fired || 0,
      },
      hideandseek: {
        overall: {
          wins: (arcade.hider_wins_hide_and_seek || 0)+(arcade.seeker_wins_hide_and_seek || 0),
          seekerwins: arcade.seeker_wins_hide_and_seek || 0,
          hiderwins: arcade.hider_wins_hide_and_seek || 0,
        },
        prophunt: {
          seekerwins: arcade.prop_hunt_seeker_wins_hide_and_seek || 0,
          hiderwins: arcade.prop_hunt_hider_wins_hide_and_seek || 0,
        },
        partypopper: {
          seekerwins: arcade.party_pooper_seeker_wins_hide_and_seek || 0,
          hiderwins: arcade.party_pooper_hider_wins_hide_and_seek || 0,
        },
      },
      hypixelsays: {
        overall: {
          wins: arcade.wins_simon_says || 0,
          totalpoints: arcade.rounds_simon_says || 0,
        },
        santa: {
          roundwins: arcade.round_wins_santa_says || 0,
          topscore: arcade.top_score_santa_says || 0,
          totalrounds: achievements.christmas2017_santa_says_rounds || 0,
          winpercentage: f(100*arcade.round_wins_santa_says/achievements.christmas2017_santa_says_rounds),
          wlr: f(arcade.round_wins_santa_says/achievements.christmas2017_santa_says_rounds),
        },
      },
      miniwalls: {
        kit: arcade.miniwalls_activeKit || "None",
        wins: arcade.wins_mini_walls || 0,
        kills: arcade.kills_mini_walls || 0,
        deaths: arcade.deaths_mini_walls || 0,
        kdr: ratio(arcade.kills_mini_walls, arcade.deaths_mini_walls) || 0,
        witherdmg: arcade.wither_damage_mini_walls || 0,
        witherkills: arcade.wither_kills_mini_walls || 0,
        arrowsshot: arcade.arrows_shot_mini_walls || 0,
        arrowshit: arcade.arrows_hit_mini_walls || 0,
        arrowhitratio: f(arcade.arrows_hit_mini_walls/arcade.arrows_shot_mini_walls),
        finals: arcade.final_kills_mini_walls || 0,
      },
      pixelpainters: {
        wins: arcade.wins_draw_their_thing || 0,
      },
      simulators: {
        easter: {
          wins: arcade.wins_easter_simulator || 0,
        },
        scuba: {
          wins: arcade.wins_scuba_simulator || 0,
        },
        halloween: {
          wins: arcade.wins_halloween_simulator || 0,
        },
        grinch: {
          wins: arcade.wins_grinch_simulator_v2 || 0,
        },
      },
      throwout: {
        wins: arcade.wins_throw_out || 0,
        kills: arcade.kills_throw_out || 0,
        deaths: arcade.deaths_throw_out || 0,
        kdr: ratio(arcade.kills_throw_out, arcade.deaths_throw_out) || 0,
      },
      zombies: {
        bestround: arcade.best_round_zombies || 0,
        wins: arcade.wins_zombies || 0,
        kills: arcade.zombie_kills_zombies || 0,
        deaths: arcade.deaths_zombies || 0,
        kdr: ratio(arcade.zombie_kills_zombies, arcade.deaths_zombies) || 0,
        headshots: arcade.headshots_zombies || 0,
        revived: arcade.players_revived_zombies || 0,
        bulletsshot: arcade.bullets_shot_zombies || 0,
        bulletshit: arcade.bullets_hit_zombies || 0,
        misshitratio: f(arcade.bullets_hit_zombies/arcade.bullets_shot_zombies) || 0,
        doors: arcade.doors_opened_zombies || 0,
        knocked: arcade.times_knocked_down_zombies || 0,
        windows: arcade.windows_repaired_zombies || 0,
        deadend: {
          bestround: arcade.best_round_zombies_deadend || 0,
          wins: arcade.wins_zombies_deadend || 0,
          deaths: arcade.deaths_zombies_deadend || 0,
          kills: arcade.zombie_kills_zombies_deadend || 0,
          revived: arcade.players_revived_zombies_deadend || 0,
          doors: arcade.doors_opened_zombies_deadend || 0,
          windows: arcade.windows_repaired_zombies_deadend || 0,
          knocked: arcade.times_knocked_down_zombies_deadend || 0,
        },
        badblood: {
          bestround: arcade.best_round_zombies_badblood || 0,
          wins: arcade.wins_zombies_badblood || 0,
          deaths: arcade.deaths_zombies_badblood || 0,
          kills: arcade.zombie_kills_zombies_badblood || 0,
          revived: arcade.players_revived_zombies_badblood || 0,
          doors: arcade.doors_opened_zombies_badblood || 0,
          windows: arcade.windows_repaired_zombies_badblood || 0,
          knocked: arcade.times_knocked_down_zombies_badblood || 0,
        },
        alienarcadium: {
          bestround: arcade.best_round_zombies_alienarcadium || 0,
          wins: arcade.wins_zombies_alienarcadium || 0,
          deaths: arcade.deaths_zombies_alienarcadium || 0,
          kills: arcade.zombie_kills_zombies_alienarcadium || 0,
          revived: arcade.players_revived_zombies_alienarcadium || 0,
          doors: arcade.doors_opened_zombies_alienarcadium || 0,
          windows: arcade.windows_repaired_zombies_alienarcadium || 0,
          knocked: arcade.times_knocked_down_zombies_alienarcadium || 0,
        },
      },
    }

    api.hypixel.stats.tkr = {
      coins: tkr.coins || 0,
      games: achievements.gingerbread_racer || 0,
      trophies: tkr.wins || 0,
      losses: (achievements.gingerbread_racer || 0)-(tkr.wins || 0),
      trophyratio: (tkr.wins || 0)/((achievements.gingerbread_racer || 0)-(tkr.wins || 0)) || 0,
      bronze: tkr.bronze_trophy || 0,
      silver: tkr.silver_trophy || 0,
      gold: tkr.gold_trophy || 0,
      wlr: (tkr.gold_trophy || 0)/((achievements.gingerbread_racer || 0)-(tkr.gold_trophy || 0)),
      grandprixtokens: tkr.grand_prix_tokens || 0,
      collectedboxes: tkr.box_pickups || 0,
      collectedcoins: tkr.coins_picked_up || 0,
      laps: tkr.laps_completed || 0,
      bananahits: tkr.banana_hits_received || 0,
      highestpos: tkr[tkrhighestpos] || 0,
      highestrt: tkr[tkrhighestrt] || 0,
    }

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
    api.hypixel.stats.pit = {
      gold: f(pitprofile.cash || 0) || 0,
      renown: pitprofile.renown || 0,
      totalrenown: achievements.pit_renown || 0,
      xp: pitprofile.xp || 0,
      prestige: pitprestige,
      prestigeroman: romanize(pitprestige),
      level: pitlevel,
      deaths: pit_stats_ptl.deaths || 0,
      kills: pit_stats_ptl.kills || 0,
      kdr: ratio(pit_stats_ptl.kills, pit_stats_ptl.deaths) || 0,
      playtime: f(toTime(pit_stats_ptl.playtime_minutes).m, 0)+"h" || "0h",
      contracts: pit_stats_ptl.contracts_completed || 0,
    }

    api.hypixel.stats.walls = {
      coins: walls.coins || 0,
      wins: walls.wins || 0,
      losses: walls.losses || 0,
      wlr: ratio(walls.wins, walls.losses) || 0,
      kills: walls.kills || 0,
      deaths: walls.deaths || 0,
      kdr: ratio(walls.kills, walls.deaths) || 0,
      assists: walls.assists || 0,
    }

    api.hypixel.stats.vampirez = {
      coins: vampirez.coins || 0,
      wins: (vampirez.human_wins || 0) + (vampirez.vampire_wins || 0),
      humanwins: vampirez.human_wins || 0,
      vampirewins: vampirez.vampire_wins || 0,
      kills: (vampirez.zombie_kills || 0) + (vampirez.vampire_kills || 0) + (vampirez.human_kills || 0),
      humankills: vampirez.human_kills || 0,
      vampirekills: vampirez.vampire_kills || 0,
      zombiekills: vampirez.zombie_kills || 0,
      mostvampirekills: vampirez.most_vampire_kills_new || 0,
      deaths: (vampirez.human_deaths || 0)+(vampirez.vampire_deaths || 0),
      kdr: ratio((vampirez.zombie_kills || 0) + (vampirez.vampire_kills || 0) + (vampirez.human_kills || 0), (vampirez.human_deaths || 0)+(vampirez.vampire_deaths || 0)),
      humandeaths: vampirez.human_deaths || 0,
      vampiredeaths: vampirez.vampire_deaths || 0,
      goldbought: vampirez.gold_bought || 0
    }

    api.hypixel.stats.tourney = {
      games: ctourney.games_played || 0,
      maxgames: 72, //   ! UPDATOVAT !
      playtime: ctourney.playtime || 0,
      tributes: ctourney.tributes_earned || 0,
      totaltributes: tourney.total_tributes || 0,
      currenttournament: currenttourney || null,
      bedwars_eight_two_0: {
        games: bedwars.tourney_bedwars_eight_two_0_games_played_bedwars || 0,
        winstreak: bedwars.tourney_bedwars_eight_two_0_winstreak2 || 0,
        wins: bedwars.tourney_bedwars_eight_two_0_wins_bedwars || 0,
        losses: bedwars.tourney_bedwars_eight_two_0_losses_bedwars || 0,
        wlr: ratio(bedwars.tourney_bedwars_eight_two_0_wins_bedwars, bedwars.tourney_bedwars_eight_two_0_losses_bedwars, 2),
        finalKills: bedwars.tourney_bedwars_eight_two_0_final_kills_bedwars || 0,
        finalDeaths: bedwars.tourney_bedwars_eight_two_0_final_deaths_bedwars || 0,
        fkdr: ratio(bedwars.tourney_bedwars_eight_two_0_final_kills_bedwars, bedwars.tourney_bedwars_eight_two_0_final_deaths_bedwars),
        kills: bedwars.tourney_bedwars_eight_two_0_kills_bedwars || 0,
        deaths: bedwars.tourney_bedwars_eight_two_0_deaths_bedwars || 0,
        kdr: ratio(bedwars.tourney_bedwars_eight_two_0_kills_bedwars, bedwars.tourney_bedwars_eight_two_0_deaths_bedwars),
        bedsBroken: bedwars.tourney_bedwars_eight_two_0_beds_broken_bedwars || 0,
        bedsLost: bedwars.tourney_bedwars_eight_two_0_beds_lost_bedwars || 0,
        bblr: ratio(bedwars.tourney_bedwars_eight_two_0_beds_broken_bedwars, bedwars.tourney_bedwars_eight_two_0_beds_lost_bedwars),
        iron: bedwars.tourney_bedwars_eight_two_0_iron_resources_collected_bedwars || 0,
        gold: bedwars.tourney_bedwars_eight_two_0_gold_resources_collected_bedwars || 0,
        diamond: bedwars.tourney_bedwars_eight_two_0_diamond_resources_collected_bedwars || 0,
        emerald: bedwars.tourney_bedwars_eight_two_0_emerald_resources_collected_bedwars || 0,
      },
      mini_walls_0: {
        kit: arcade.miniwalls_activeKit || "None",
        wins: arcade.wins_tourney_mini_walls_0 || 0,
        kills: arcade.kills_tourney_mini_walls_0 || 0,
        deaths: arcade.deaths_tourney_mini_walls_0 || 0,
        kdr: ratio(arcade.kills_tourney_mini_walls_0, arcade.deaths_tourney_mini_walls_0) || 0,
        witherdmg: arcade.wither_damage_tourney_mini_walls_0 || 0,
        witherkills: arcade.wither_kills_tourney_mini_walls_0 || 0,
        arrowsshot: arcade.arrows_shot_tourney_mini_walls_0 || 0,
        arrowshit: arcade.arrows_hit_tourney_mini_walls_0 || 0,
        arrowhitratio: f(arcade.arrows_hit_tourney_mini_walls_0/arcade.arrows_shot_tourney_mini_walls_0),
        finals: arcade.final_kills_tourney_mini_walls_0 || 0,
      },
      gingerbread_solo_1: {
        games: ctourney.games_played || 0,
        trophies: tkr.tourney_gingerbread_solo_1_wins || 0,
        losses: (ctourney.games_played || 0)-(tkr.tourney_gingerbread_solo_1_wins || 0),
        trophyratio: (tkr.tourney_gingerbread_solo_1_wins || 0)/((ctourney.games_played || 0)-(tkr.tourney_gingerbread_solo_1_wins || 0)) || 0,
        bronze: tkr.tourney_gingerbread_solo_1_bronze_trophy || 0,
        silver: tkr.tourney_gingerbread_solo_1_silver_trophy || 0,
        gold: tkr.tourney_gingerbread_solo_1_gold_trophy || 0,
        wlr: (tkr.tourney_gingerbread_solo_1_gold_trophy || 0)/((ctourney.games_played || 0)-(tkr.tourney_gingerbread_solo_1_gold_trophy || 0)) || 0,
      }
    }

    // api.hypixel.stats.quake = {
    //   coins: quake.coins || 0,
    //   bestkillstreak: quake.highest_killstreak || 0,
    //   kills: quake.kills || 0 + quake.kills_teams || 0,
    //   deaths: quake.deaths || 0 + quake.deaths_teams || 0,
    //   kdr: ratio(quake.kills || 0 + quake.kills_teams || 0, quake.deaths || 0 + quake.deaths_teams || 0),
    //   wins: quake.wins || 0 + quake.wins_teams || 0,
    //   headshots: quake.headshots || 0 + quake.headshots_teams || 0,
    // }

    api.hypixel.stats.quake = {
      coins: quake.coins || 0,
      bestkillstreak: quake.highest_killstreak || 0,
      kills: (quake.kills||0)+quake.kills_teams || 0,
      deaths: (quake.deaths||0)+quake.deaths_teams || 0,
      kdr: ratio((quake.kills||0) + (quake.kills_teams||0), (quake.deaths||0) + (quake.deaths_teams||0)),
      wins: (quake.wins||0) + quake.wins_teams || 0,
      headshots: (quake.headshots||0) + quake.headshots_teams || 0,
    }

    api.hypixel.stats.duels = {
      coins: duels.coins || 0,
      winstreak: duels.current_winstreak || 0,
      bestwinstreak: duels.best_overall_winstreak || 0,
      wins: duels.wins || 0,
      losses: duels.losses || 0,
      wlr: ratio((duels.wins || 0), (duels.losses || 0)),
      kills: duels.kills || 0,
      deaths: duels.deaths || 0,
      kdr: ratio((duels.kills || 0), (duels.deaths || 0)),
      games: duels.games_played_duels || 0,
      lootchests: duels.duels_chests || 0,
    }

    const wwclass = {
      kills: {
        Archer: wwclasses.archer ? wwclasses.archer.kills || 0 : 0,
        Assault: wwclasses.assault ? wwclasses.assault.kills || 0 : 0,
        Swordsman: wwclasses.swordsman ? wwclasses.swordsman.kills || 0 : 0,
        Tank: wwclasses.tank ? wwclasses.tank.kills || 0 : 0,
        Golem: wwclasses.golem ? wwclasses.golem.kills || 0 : 0,
        Engineer: wwclasses.engineer ? wwclasses.engineer.kills || 0 : 0,
      }
    }
    let ww_main_class = Object.entries(wwclass.kills).reduce((a, b) => a[1] > b[1] ? a : b)

    api.hypixel.stats.ww = {
      coins: ww.coins || 0,
      xp: wwprogress.experience || 0,
      level: getWwLevel(wwprogress.experience || 0).level,
      levelxpleft: getWwLevel(wwprogress.experience || 0).xpleft,
      levelformatted: getWwLevel(wwprogress.experience || 0).levelformatted,
      layers: wwprogress.available_layers || 0,
      games: wwstats.games_played || 0,
      wins: wwstats.wins || 0,
      losses: (wwstats.games_played || 0)-(wwstats.wins || 0),
      wlr: ratio(wwstats.wins || 0, (wwstats.games_played || 0)-(wwstats.wins || 0)),
      kills: wwstats.kills || 0,
      deaths: wwstats.deaths || 0,
      kdr: ratio(wwstats.kills || 0, wwstats.deaths || 0),
      assists: wwstats.assists || 0,
      blocks_broken: wwstats.blocks_broken || 0,
      blocks_placed: wwstats.wool_placed || 0,
      powerups: wwstats.powerups_gotten || 0,
      selected_class: wwexpand.selected_class || "NONE",
      main_class: ww_main_class || [ 'None', 0 ],
      classes: {
        archer: {
          wins: wwclasses.archer ? wwclasses.archer.wins || 0 : 0,
          games: wwclasses.archer ? wwclasses.archer.games_played || 0 : 0,
          kills: wwclasses.archer ? wwclasses.archer.kills || 0 : 0,
        },
        assault: {
          wins: wwclasses.assault ? wwclasses.assault.wins || 0 : 0,
          games: wwclasses.assault ? wwclasses.assault.games_played || 0 : 0,
          kills: wwclasses.assault ? wwclasses.assault.kills || 0 : 0,
        },
        swordsman: {
          wins: wwclasses.swordsman ? wwclasses.swordsman.wins || 0 : 0,
          games: wwclasses.swordsman ? wwclasses.swordsman.games_played || 0 : 0,
          kills: wwclasses.swordsman ? wwclasses.swordsman.kills || 0 : 0,
        },
        tank: {
          wins: wwclasses.tank ? wwclasses.tank.wins || 0 : 0,
          games: wwclasses.tank ? wwclasses.tank.games_played || 0 : 0,
          kills: wwclasses.tank ? wwclasses.tank.kills || 0 : 0,
        },
        golem: {
          wins: wwclasses.golem ? wwclasses.golem.wins || 0 : 0,
          games: wwclasses.golem ? wwclasses.golem.games_played || 0 : 0,
          kills: wwclasses.golem ? wwclasses.golem.kills || 0 : 0,
        },
        engineer: {
          wins: wwclasses.engineer ? wwclasses.engineer.wins || 0 : 0,
          games: wwclasses.engineer ? wwclasses.engineer.games_played || 0 : 0,
          kills: wwclasses.engineer ? wwclasses.engineer.kills || 0 : 0,
        },
      },
    }

    api.hypixel.stats.bb = {
      score: bb.score || 0,
      title: uhg.getBuildBattle(bb.score || 0),
      coins: bb.coins || 0,
      overall: {
        wins: bb.wins || 0,
        games: bb.games_played || 0,
        losses: (bb.games_played || 0)-(bb.wins || 0),
        wlr: ratio(bb.wins || 0, (bb.games_played || 0)-(bb.wins || 0))
      },
      guess: {
        wins: bb.wins_guess_the_build || 0,
        guesses: bb.correct_guesses || 0,
      },
      pro: {
        wins: bb.wins_solo_pro || 0,
      }
    }

    api.hypixel.stats.paintball = {
      coins: pb.coins || 0,
      wins: pb.wins || 0,
      kills: pb.kills || 0,
      deaths: pb.deaths || 0,
      kdr: ratio(pb.kills || 0, pb.deaths || 0),
      shots: pb.shots_fired || 0,
      killstreaks: pb.killstreaks || 0,
      hat: pb.hat || "None",
      prefix: pb.selectedKillPrefix || ""
    }

    api.hypixel.stats.cac = {
      coins: cac.coins || 0,
      overall: {
        wins: (cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(cac.game_wins_gungame || 0),
        roundwins: cac.round_wins || 0,
        kills: (cac.kills || 0)+(cac.headshot_kills || 0)+(cac.grenade_kills || 0)+(cac.kills_deathmatch || 0)+(cac.kills_gungame || 0),
        kdr: ratio((cac.kills || 0)+(cac.headshot_kills || 0)+(cac.grenade_kills || 0)+(cac.kills_deathmatch || 0)+(cac.kills_gungame || 0), (cac.deaths || 0)+(cac.deaths_deathmatch || 0)+(cac.deaths_gungame || 0)),
        headshotkills: cac.headshot_kills || 0,
        nadekills: cac.grenade_kills || 0,
        deaths: (cac.deaths || 0)+(cac.deaths_deathmatch || 0)+(cac.deaths_gungame || 0),
        assists: (cac.assists || 0)+(cac.assists_gungame || 0)+(cac.assists_deathmatch || 0),
        games: (cac.game_plays || 0)+(cac.game_plays_gungame || 0)+(cac.game_plays_deathmatch || 0),
        losses: (cac.game_plays || 0)+(cac.game_plays_gungame || 0)+(cac.game_plays_deathmatch || 0) - (cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(cac.game_wins_gungame || 0),
        wlr: (ratio((cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(cac.game_wins_gungame || 0), (cac.game_plays || 0)+(cac.game_plays_gungame || 0)+(cac.game_plays_deathmatch || 0) - (cac.game_wins_deathmatch || 0)+(cac.game_wins || 0)+(cac.game_wins_gungame || 0))),
        shots: cac.shots_fired || 0,
      },
      defusal: {
        wins: cac.game_wins || 0,
        games: cac.game_plays || 0,
        losses: (cac.game_plays || 0)-(cac.game_wins || 0),
        wlr: ratio(cac.game_wins || 0, (cac.game_plays || 0)-(cac.game_wins || 0)),
        kills: cac.kills || 0,
        deaths: cac.deaths || 0,
        kdr: ratio(cac.kills || 0, cac.deaths || 0),
        assists: cac.assists || 0,
        bombsplanted: cac.bombs_planted || 0,
        bombsdefused: cac.bombs_defused || 0,
      },
      deathmatch: {
        wins: cac.game_wins_deathmatch || 0,
        games: cac.game_plays_deathmatch || 0,
        losses: (cac.game_plays_deathmatch || 0)-(cac.game_wins_deathmatch || 0),
        wlr: ratio(cac.game_wins_deathmatch || 0, (cac.game_plays_deathmatch || 0)-(cac.game_wins_deathmatch || 0)),
        kills: cac.kills_deathmatch || 0,
        deaths: cac.deaths_deathmatch || 0,
        kdr: ratio(cac.kills_deathmatch || 0, cac.deaths_deathmatch || 0),
        assists: cac.assists_deathmatch || 0,
      },
      gungame: {
        wins: cac.game_wins_gungame || 0,
        games: cac.game_plays_gungame || 0,
        losses: (cac.game_plays_gungame || 0)-(cac.game_wins_gungame || 0),
        wlr: ratio(cac.game_wins_gungame || 0, (cac.game_plays_gungame || 0)-(cac.game_wins_gungame || 0)),
        kills: cac.kills_gungame || 0,
        deaths: cac.deaths_gungame || 0,
        kdr: ratio(cac.kills_gungame || 0, cac.deaths_gungame || 0),
        assists: cac.assists_gungame || 0,
        besttime: cac.fastest_win_gungame || 0,
      },
    }
    api.hypixel.stats.cac.score = Math.round(api.hypixel.stats.cac.kills/2 + (api.hypixel.stats.cac.bombsdefused + api.hypixel.stats.cac.bombsplanted)/3 + api.hypixel.stats.cac.wins + api.hypixel.stats.cac.kills / api.hypixel.stats.cac.shots * 200)
    api.hypixel.stats.cac.color = uhg.getCaC(api.hypixel.stats.cac.score)

    api.hypixel.stats.uhc = {
      coins: uhc.coins || 0,
      wins: (uhc.wins || 0)+(uhc.wins_solo || 0),
      kills: (uhc.kills || 0)+(uhc.kills_solo || 0),
      deaths: (uhc.deaths || 0)+(uhc.deaths_solo || 0),
      kdr: ratio((uhc.kills || 0)+(uhc.kills_solo || 0), (uhc.deaths || 0)+(uhc.deaths_solo || 0)),
      kit: uhc.equippedKit || "NONE",
      score: uhc.score || 0,
      ultimates: (uhc.ultimates_crafted || 0)+(uhc.ultimates_crafted_solo || 0),
      extraultimates: (uhc.extra_ultimates_crafted_solo || 0)+(uhc.extra_ultimates_crafted || 0)
    }
    //api.hypixel.stats.uhc.score = api.hypixel.stats.uhc.kills + api.hypixel.stats.uhc.wins * 10
    api.hypixel.stats.uhc.level = uhg.getUHC(api.hypixel.stats.uhc.score)

    api.hypixel.stats.speeduhc = {
      coins: speeduhc.coins || 0,
      winstreak: speeduhc.win_streak || speeduhc.winstreak || 0,
      highestwinstreak: speeduhc.highestWinstreak || 0,
      killstreak: speeduhc.killstreak || 0,
      highestkillstreak: speeduhc.highestKillstreak || 0,
      wins: speeduhc.wins || 0,
      losses: speeduhc.losses || 0,
      wlr: ratio(speeduhc.wins || 0, speeduhc.losses || 0),
      kills: speeduhc.kills || 0,
      deaths: speeduhc.deaths || 0,
      kdr: ratio(speeduhc.kills || 0, speeduhc.deaths || 0),
      assists: speeduhc.assists || 0,
      score: speeduhc.score_normal || 0,
      level: uhg.getSpeedUHC(speeduhc.score_normal || 0),
      masterperk: uhg.getSpeedUHCPerk(speeduhc.activeMasterPerk || "None")
    }

    api.hypixel.stats.blitz = {
      coins: blitz.coins || 0,
      wins: (blitz.wins || 0)+(blitz.wins_teams || 0),
      deaths: blitz.deaths || 0,
      kills: blitz.kills || 0,
      kdr: ratio(blitz.kills, blitz.deaths, 2),
      damage: blitz.damage || 0,
      games: blitz.games_played || 0,
    }

}


  if (call.includes("guild")) {
    var guild = await fetch(`https://api.hypixel.net/guild?key=${api_key}&player=${uuid}`).then(api => api.json())
    if (!guild.success) return `Guild API: ${guild.cause}`
    if (!guild.guild) api.guild = {guild: false, name: "Žádná"}
    else {
      var guild = guild.guild;
      api.guild = {
        guild: true,
        name: guild.name,
        tag: guild.tag,
        color: getPlusColor(null, guild.tagColor).hex,
        url: `https://plancke.io/hypixel/guild/player/${nickname}`,
      }
      api.guild.all = guild
      api.guild.member = guild.members.filter(n => n.uuid == uuid)[0]
    }
  }

  if (call.includes("online")) {
    var online = await fetch(`https://api.hypixel.net/status?key=${api_key}&uuid=${uuid}`).then(api => api.json())
    if (!online.success) return `Online API: ${online.cause || "error"}`
    if (!online.session.online) api.online = {online: false, icon: "https://cdn.discordapp.com/attachments/875503784086892617/896772378678394890/unknown.png", footer: 'Vývojáři Farmans & DavidCzPdy', title: "Offline"}
    else {
      api.online = getOnline(online.session)
      api.online.online = true,
      api.online.icon = "https://cdn.discordapp.com/attachments/875503784086892617/896771219817365514/unknown.png"
    }
  }

  if (call.includes("recent")) {
    let recent = await fetch(`https://api.hypixel.net/recentgames?key=${api_key}&uuid=${uuid}`).then(api => api.json())
    if (!recent.success) return `Recent Games API: ${recent.cause || "error"}`
    api.recent = {games: recent.games}
  }

  if (call.includes("skywars")) {

    var skywars = await fetch(`https://api.hypixel.net/player/ranked/skywars?key=${api_key}&uuid=${uuid}`).then(api => api.json())
    if (!skywars.success) skywars = {}
    else skywars = skywars.result
    api.rsw = {position:skywars.position || 0, rating: skywars.score || 0, div: getRankedPosition(skywars.position || 0)}
  }

  if (call.includes("gamecounts")) {
    var gamecounts = await fetch(`https://api.hypixel.net/gameCounts?key=${api_key}`).then(api => api.json())
    if (!gamecounts.success) gamecounts = {games: {}}
    api.gamecounts = {
      games: {
        mainlobby: gamecounts.games.MAIN_LOBBY.players || 0,
        tourneylobby: gamecounts.games.TOURNAMENT_LOBBY.players || 0,
        smp: gamecounts.games.SMP.players || 0,
        legacy: {
          players: gamecounts.games.LEGACY.players || 0,
          vampirez: gamecounts.games.LEGACY.modes.VAMPIREZ || 0,
          tkr: gamecounts.games.LEGACY.modes.GINGERBREAD || 0,
          arena: gamecounts.games.LEGACY.modes.ARENA || 0,
          quake: gamecounts.games.LEGACY.modes.QUAKECRAFT || 0,
          paintball: gamecounts.games.LEGACY.modes.PAINTBALL || 0,
          walls: gamecounts.games.LEGACY.modes.WALLS || 0,
        },
        supersmash: gamecounts.games.SUPER_SMASH.players || 0,
        duels: gamecounts.games.DUELS.players || 0,
        pit: gamecounts.games.PIT.players || 0,
        woolwars: gamecounts.games.WOOL_GAMES.players || 0,
        replay: gamecounts.games.REPLAY.players || 0,
        blitz: gamecounts.games.SURVIVAL_GAMES.players || 0,
        speeduhc: gamecounts.games.SPEED_UHC.players || 0,
        buildbattle: gamecounts.games.BUILD_BATTLE.players || 0,
        prototype: {
          players: gamecounts.games.PROTOTYPE.players || 0,
          pixelparty: gamecounts.games.PROTOTYPE.modes.PIXEL_PARTY || 0,
        },
        tntgames: gamecounts.games.TNTGAMES.players || 0,
        cac: gamecounts.games.MCGO.players || 0,
        housing: gamecounts.games.HOUSING.players || 0,
        bedwars: gamecounts.games.BEDWARS.players || 0,
        murder: gamecounts.games.MURDER_MYSTERY.players || 0,
        uhc: gamecounts.games.UHC.players || 0,
        mw: gamecounts.games.WALLS3.players || 0,
        arcade: gamecounts.games.ARCADE.players || 0,
        warlords: gamecounts.games.BATTLEGROUND.players || 0,
        queue: gamecounts.games.QUEUE.players || 0,
        limbo: gamecounts.games.LIMBO.players || 0,
        idle: gamecounts.games.IDLE.players || 0,
        skywars: {
          players: gamecounts.games.SKYWARS.players || 0,
          mega: gamecounts.games.SKYWARS.modes.mega_normal || 0,
        },
        skyblock: {
          players: gamecounts.games.SKYBLOCK.players || 0,
          crimson_isle: gamecounts.games.SKYBLOCK.modes.crimson_isle || 0,
          dungeons: gamecounts.games.SKYBLOCK.modes.dungeon || 0,
          hollows: gamecounts.games.SKYBLOCK.modes.crystal_hollows || 0,
        },
      },
      playerCount: gamecounts.playerCount || 0,
    
  }
}

  if (call.includes("skyblock")||skyblocki.length) {
    api.skyblock = {}
    api.skyblock.dungeons = {}
    api.skyblock.slayers = {}
    api.skyblock.skills = {}
    api.skyblock.main = {}
    api.skyblock.mining = {}
    api.skyblock.nether = {}

    var skyblock = await fetch(`https://api.hypixel.net/skyblock/profiles?key=${api_key}&uuid=${uuid}`).then(api => api.json())
    if (!skyblock.success) return "Chyba v skyblock api"
    let profiles = skyblock.profiles
    if (!profiles) return "Hráč nehrál SkyBlock"
    if (skyblocki.includes("all")) {api.skyblock.all = skyblock}
    if (skyblocki.includes("dungeons")) {
      for (let i=0;i<profiles.length; i++) {
        let profilname = profiles[i].cute_name
        let dungeons = profiles[i].members[uuid].dungeons || null
        if (!dungeons||!dungeons.selected_dungeon_class) continue
        let secrets = skyblocksecrets || 0
        let catacombs = dungeons.dungeon_types.catacombs || {}
        let mastercatacombs = dungeons.dungeon_types.master_catacombs || {}
        let runscata = catacombs.tier_completions || {}
        let runsmm = mastercatacombs.tier_completions || {}
        let runs = 0;
        for (let o in runscata) {
          if (runscata.hasOwnProperty(o)) {
            runs += parseFloat(runscata[o]);
          }
        }
        for (let o in runsmm) {
          if (runsmm.hasOwnProperty(o)) {
            runs += parseFloat(runsmm[o]);
          }
        }
        let secretsperrun = secrets/runs || 0
        let classes = dungeons.player_classes || {}
        let healer = getLevelByXp(classes.healer.experience, "dungeons")
        let mage = getLevelByXp(classes.mage.experience, "dungeons")
        let berserk = getLevelByXp(classes.berserk.experience, "dungeons")
        let archer = getLevelByXp(classes.archer.experience, "dungeons")
        let tank = getLevelByXp(classes.tank.experience, "dungeons")
        let catalvl = await getCataLvl(catacombs.experience||0)
        let bloodmobkills = (profiles[i].members[uuid]?.stats?.kills_watcher_summon_undead || 0) + (profiles[i].members[uuid]?.stats?.kills_master_watcher_summon_undead || 0)

       api.skyblock.dungeons[profilname] = {
         level: catalvl,
         secrets: secrets,
         runs: runs,
         secretsratio: secretsperrun,
         "class": dungeons.selected_dungeon_class,
         overallclassxp: healer+mage+berserk+archer+tank,
         classavg: (healer+mage+berserk+archer+tank)/5,
         healerlvl: healer,
         magelvl: mage,
         berserklvl: berserk,
         archerlvl: archer,
         tanklvl: tank,
         bloodmobkills: bloodmobkills
       }
      }
    }
    if (skyblocki.includes("slayers")) {
      for (let i=0;i<profiles.length; i++) {
        let profilname = profiles[i].cute_name
        let slayers = profiles[i].members[uuid].slayer_bosses || null
        if (!slayers) continue
        let zombie = slayers.zombie || {}
        let spider = slayers.spider || {}
        let wolf = slayers.wolf || {}
        let eman = slayers.enderman || {}
        let blaze = slayers.blaze || {}
        let overallxp = (zombie.xp || 0)+(spider.xp || 0)+(eman.xp || 0)+(wolf.xp || 0)+(blaze.xp || 0)
        let zombiexp = zombie.xp || 0
        let spiderxp = spider.xp || 0
        let emanxp = eman.xp || 0
        let wolfxp = wolf.xp || 0
        let blazexp = blaze.xp || 0
        let zombielvl = getSlayerLvl(zombiexp, "zombie");
        let spiderlvl = getSlayerLvl(spiderxp, "spider");
        let wolflvl = getSlayerLvl(wolfxp, "wolf");
        let emanlvl = getSlayerLvl(emanxp, "eman");
        let blazelvl = getSlayerLvl(blazexp, "blaze");

       api.skyblock.slayers[profilname] = {
         overallxp: overallxp,
         zombiexp: zombiexp,
         spiderxp: spiderxp,
         wolfxp: wolfxp,
         emanxp: emanxp,
         blazexp: blazexp,
         wolflvl: wolflvl,
         emanlvl: emanlvl,
         zombielvl: zombielvl,
         spiderlvl: spiderlvl,
         blazelvl: blazelvl,
       }
      }
    }
    if (skyblocki.includes("skills")) {
      for (let i=0;i<profiles.length; i++) {
        let profilname = profiles[i].cute_name
        let skills = profiles[i].members[uuid] || null
        if (!skills) continue
        let achievs = false;
        if (!skills.experience_skill_taming || !skills.experience_skill_mining || !skills.experience_skill_foraging || !skills.experience_skill_enchanting || !skills.experience_skill_carpentry || !skills.experience_skill_farming || !skills.experience_skill_combat || !skills.experience_skill_fishing || !skills.experience_skill_alchemy || !skills.experience_skill_runecrafting || !skills.experience_skill_social2) achievs = true
        let overallxp = (skills.experience_skill_taming || 0)+(skills.experience_skill_mining || 0)+(skills.experience_skill_foraging || 0)+(skills.experience_skill_enchanting || 0)+(skills.experience_skill_carpentry || 0)+(skills.experience_skill_farming || 0)+(skills.experience_skill_combat || 0)+(skills.experience_skill_fishing || 0)+(skills.experience_skill_alchemy || 0)+(skills.experience_skill_runecrafting || 0)+(skills.experience_skill_social2 || 0)
        let taming = getLevelByXp(skills.experience_skill_taming || 0, "taming", "50")
        let mining = getLevelByXp(skills.experience_skill_mining || 0, "mining", "60")
        let foraging = getLevelByXp(skills.experience_skill_foraging || 0, "foraging", "50")
        let enchanting = getLevelByXp(skills.experience_skill_enchanting || 0, "enchanting", "60")
        let carpentry = getLevelByXp(skills.experience_skill_carpentry || 0, "carpentry", "50")
        let farming = getLevelByXp(skills.experience_skill_farming || 0, "farming", "60")
        let combat = getLevelByXp(skills.experience_skill_combat || 0, "combat", "60")
        let fishing = getLevelByXp(skills.experience_skill_fishing || 0, "fishing", "50")
        let alchemy = getLevelByXp(skills.experience_skill_alchemy || 0, "alchemy", "50")
        let runecrafting = getLevelByXp(skills.experience_skill_runecrafting || 0, "runecrafting", "25")
        let social = getLevelByXp(skills.experience_skill_social2 || 0, "social", "25")
        if (achievs == true) {
          taming = achievements.skyblock_domesticator || 0
          mining = achievements.skyblock_excavator || 0
          foraging = achievements.skyblock_gatherer || 0
          enchanting = achievements.skyblock_augmentation || 0
          farming = achievements.skyblock_harvester || 0
          combat = achievements.skyblock_combat || 0
          fishing = achievements.skyblock_angler || 0
          alchemy = achievements.skyblock_concoctor || 0
        }
       api.skyblock.skills[profilname] = {
         overallxp: overallxp,
         skillavg: (taming+mining+foraging+enchanting+farming+combat+fishing+alchemy+carpentry)/9,
         taming: taming,
         mining: mining,
         foraging: foraging,
         enchanting: enchanting,
         carpentry: carpentry,
         farming: farming,
         combat: combat,
         fishing: fishing,
         alchemy: alchemy,
         runecrafting: runecrafting,
         social: social,
         apioff: achievs,
       }
      }
    }
    if (skyblocki.includes("main")) {
      for (let i=0;i<profiles.length; i++) {
        let profilname = profiles[i].cute_name
        let main = profiles[i].members[uuid] || null
        let banking = profiles[i].banking || null
        let bank = 0;
        let purse = 0;
        let apioff = false;
        let cakes = {};
        if (main) {
          purse = main.coin_purse
          cakes = main.temp_stat_buffs
        }
        if (banking) bank = banking.balance
        if (!banking) apioff = true

       api.skyblock.main[profilname] = {
         cakes: cakes,
         bank: {
          purse: purse,
          bank: bank,
          sum: purse+bank,
          apioff: apioff,
         },
       }
      }
    }
    if (skyblocki.includes("mining")) {
      for (let i=0;i<profiles.length; i++) {
        let profilname = profiles[i].cute_name
        let mining = profiles[i].members[uuid].mining_core || null
        if (!mining) continue
        let mithril = 0;
        let gemstone = 0;
        let hotmtier = 0;
        let hotmxp = 0;
        let nucleus = 0;
        let scatha = 0;
        let commissions = achievements.skyblock_hard_working_miner || 0
        let sbstats = profiles[i].members[uuid].stats || null
        if (sbstats) scatha = sbstats.kills_scatha || 0
        let crystals = mining.crystals || null
        if (crystals) nucleus = Math.floor(((crystals.jade_crystal.total_placed || 0)+(crystals.sapphire_crystal.total_placed || 0)+(crystals.amethyst_crystal.total_placed || 0)+(crystals.amber_crystal.total_placed || 0)+(crystals.topaz_crystal.total_placed || 0))/5)
        if (mining) {
          mithril = (mining.powder_mithril || 0)+(mining.powder_spent_mithril || 0)
          gemstone = (mining.powder_gemstone || 0)+(mining.powder_spent_gemstone || 0)
          hotmxp = mining.experience || 0
          hotmtier = getHotmTier(mining.experience || 0)
        }

       api.skyblock.mining[profilname] = {
         powdersum: mithril+gemstone,
         mithril: mithril,
         gemstone: gemstone,
         hotmxp: hotmxp,
         hotmtier: hotmtier,
         nucleus: nucleus,
         comms: commissions,
         scatha: scatha,
       }
      }
    }
    if (skyblocki.includes("nether")) {
      for (let i=0;i<profiles.length; i++) {
        let profilname = profiles[i].cute_name
        let nether = profiles[i].members[uuid] || null
        if (!nether) continue
        let netherdata = nether.nether_island_player_data || null
        let quests;
        let kuudras = 0;
        let dojo = 0;
        let faction = "Žádná";
        let reputation = 0;
        let trophies = 0;
        if (netherdata) {
          if (netherdata.quests && netherdata.quests.quest_data) quests = netherdata.quests.quest_data.quest_list || []
          for (let i in netherdata.kuudra_completed_tiers) {
            kuudras += netherdata.kuudra_completed_tiers[i]
          }
          for (let i in netherdata.dojo) {
            if (i.includes("points")) dojo += netherdata.dojo[i]
            continue
          }
          faction = netherdata.selected_faction || "Žádná"
          if (faction == "barbarians") reputation = netherdata.barbarians_reputation || 0
          else if (faction == "mages") reputation = netherdata.mages_reputation || 0
        }
        let trophy = nether.trophy_fish || null
        if (trophy) {
          trophies = trophy.total_caught || 0
        }

       api.skyblock.nether[profilname] = {
        quests: getCrimson(quests),
        trophies: trophies,
        kuudras: kuudras,
        dojo: dojo,
        faction: faction,
        rep: reputation,
       }
      }
    }
  }

  api.uuid = uuid
  api.username = nickname || hypixel.displayname || ""
  // api.skin = `https://mc-heads.net/body/${uuid}.png`
  // api.plancke = `https://plancke.io/hypixel/player/stats/${nickname || hypixel.displayname || "hypixel"}`
  // api.hypixellogo = `https://cdn.discordapp.com/attachments/875503784086892617/896765939285114960/hypixel.png`

  let test = false
  if (test && api.hypixel) {
    const mongo = require("./mongodb.js")
    mongo.update("stats", "stats", {_id: api.uuid}, api.hypixel, false)
  }

  return api


} catch (e) {
  console.log(String(e.stack).bgRed)
  return "Chyba v API, kontaktujte vývojáře (<@!312861502073995265>)"
}
}

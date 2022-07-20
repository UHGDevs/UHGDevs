
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
  const arcade = hypixel.stats.Arcade || {}
  const achievements = hypixel.achievements || {}
  return ({
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
      kdr: func.ratio(arcade.kills_oneinthequiver, arcade.deaths_oneinthequiver) || 0,
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
      kdr: func.ratio(arcade.sw_kills, arcade.sw_deaths) || 0,
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
        winpercentage: func.f(100*arcade.round_wins_santa_says/achievements.christmas2017_santa_says_rounds),
        wlr: func.f(arcade.round_wins_santa_says/achievements.christmas2017_santa_says_rounds),
      },
    },
    miniwalls: {
      kit: arcade.miniwalls_activeKit || "None",
      wins: arcade.wins_mini_walls || 0,
      kills: arcade.kills_mini_walls || 0,
      deaths: arcade.deaths_mini_walls || 0,
      kdr: func.ratio(arcade.kills_mini_walls, arcade.deaths_mini_walls) || 0,
      witherdmg: arcade.wither_damage_mini_walls || 0,
      witherkills: arcade.wither_kills_mini_walls || 0,
      arrowsshot: arcade.arrows_shot_mini_walls || 0,
      arrowshit: arcade.arrows_hit_mini_walls || 0,
      arrowhitratio: func.f(arcade.arrows_hit_mini_walls/arcade.arrows_shot_mini_walls),
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
      kdr: func.ratio(arcade.kills_throw_out, arcade.deaths_throw_out) || 0,
    },
    zombies: {
      bestround: arcade.best_round_zombies || 0,
      wins: arcade.wins_zombies || 0,
      kills: arcade.zombie_kills_zombies || 0,
      deaths: arcade.deaths_zombies || 0,
      kdr: func.ratio(arcade.zombie_kills_zombies, arcade.deaths_zombies) || 0,
      headshots: arcade.headshots_zombies || 0,
      revived: arcade.players_revived_zombies || 0,
      bulletsshot: arcade.bullets_shot_zombies || 0,
      bulletshit: arcade.bullets_hit_zombies || 0,
      misshitratio: func.f(arcade.bullets_hit_zombies/arcade.bullets_shot_zombies) || 0,
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
  })
}
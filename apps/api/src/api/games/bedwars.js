
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const bedwars = hypixel.stats.Bedwars || {}
    const achievements = hypixel.achievements || {}
    let modes = {
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
    }

    let bw_main_mode = Object.entries(modes).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    
    return ({
      level: func.getBwLevel(bedwars.Experience),
      levelformatted: `[${Math.floor(func.getBwLevel(bedwars.Experience))}☆]`,
      xp: bedwars.Experience || 0,
      coins: bedwars.coins || 0,
      main_mode: func.getGamemode(bw_main_mode),
      overall: {
          games: bedwars.games_played_bedwars || 0,
          winstreak: bedwars.winstreak || 0,
          wins: bedwars.wins_bedwars || 0,
          losses: bedwars.losses_bedwars || 0,
          wlr: func.ratio(bedwars.wins_bedwars, bedwars.losses_bedwars, 2),
          finalKills: bedwars.final_kills_bedwars || 0,
          finalDeaths: bedwars.final_deaths_bedwars || 0,
          fkdr: func.ratio(bedwars.final_kills_bedwars, bedwars.final_deaths_bedwars),
          kills: bedwars.kills_bedwars || 0,
          deaths: bedwars.deaths_bedwars || 0,
          kdr: func.ratio(bedwars.kills_bedwars, bedwars.deaths_bedwars),
          bedsBroken: bedwars.beds_broken_bedwars || 0,
          bedsLost: bedwars.beds_lost_bedwars || 0,
          bblr: func.ratio(bedwars.beds_broken_bedwars, bedwars.beds_lost_bedwars),
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
          wlr: func.ratio(bedwars.eight_one_wins_bedwars, bedwars.eight_one_losses_bedwars),
          finalKills: bedwars.eight_one_final_kills_bedwars || 0,
          finalDeaths: bedwars.eight_one_final_deaths_bedwars || 0,
          fkdr: func.ratio(bedwars.eight_one_final_kills_bedwars, bedwars.eight_one_final_deaths_bedwars),
          kills: bedwars.eight_one_kills_bedwars || 0,
          deaths: bedwars.eight_one_deaths_bedwars || 0,
          kdr: func.ratio(bedwars.eight_one_kills_bedwars, bedwars.eight_one_deaths_bedwars),
          bedsBroken: bedwars.eight_one_beds_broken_bedwars || 0,
          bedsLost: bedwars.eight_one_beds_lost_bedwars || 0,
          bblr: func.ratio(bedwars.eight_one_beds_broken_bedwars, bedwars.eight_one_beds_lost_bedwars),
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
          wlr: func.ratio(bedwars.eight_two_wins_bedwars, bedwars.eight_two_losses_bedwars),
          finalKills: bedwars.eight_two_final_kills_bedwars || 0,
          finalDeaths: bedwars.eight_two_final_deaths_bedwars || 0,
          fkdr: func.ratio(bedwars.eight_two_final_kills_bedwars, bedwars.eight_two_final_deaths_bedwars),
          kills: bedwars.eight_two_kills_bedwars || 0,
          deaths: bedwars.eight_two_deaths_bedwars || 0,
          kdr: func.ratio(bedwars.eight_two_kills_bedwars, bedwars.eight_two_deaths_bedwars),
          bedsBroken: bedwars.eight_two_beds_broken_bedwars || 0,
          bedsLost: bedwars.eight_two_beds_lost_bedwars || 0,
          bblr: func.ratio(bedwars.eight_two_beds_broken_bedwars, bedwars.eight_two_beds_lost_bedwars),
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
          wlr: func.ratio(bedwars.four_three_wins_bedwars, bedwars.four_three_losses_bedwars),
          finalKills: bedwars.four_three_final_kills_bedwars || 0,
          finalDeaths: bedwars.four_three_final_deaths_bedwars || 0,
          fkdr: func.ratio(bedwars.four_three_final_kills_bedwars, bedwars.four_three_final_deaths_bedwars),
          kills: bedwars.four_three_kills_bedwars || 0,
          deaths: bedwars.four_three_deaths_bedwars || 0,
          kdr: func.ratio(bedwars.four_three_kills_bedwars, bedwars.four_three_deaths_bedwars),
          bedsBroken: bedwars.four_three_beds_broken_bedwars || 0,
          bedsLost: bedwars.four_three_beds_lost_bedwars || 0,
          bblr: func.ratio(bedwars.four_three_beds_broken_bedwars, bedwars.four_three_beds_lost_bedwars),
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
          wlr: func.ratio(bedwars.four_four_wins_bedwars, bedwars.four_four_losses_bedwars),
          finalKills: bedwars.four_four_final_kills_bedwars || 0,
          finalDeaths: bedwars.four_four_final_deaths_bedwars || 0,
          fkdr: func.ratio(bedwars.four_four_final_kills_bedwars, bedwars.four_four_final_deaths_bedwars),
          kills: bedwars.four_four_kills_bedwars || 0,
          deaths: bedwars.four_four_deaths_bedwars || 0,
          kdr: func.ratio(bedwars.four_four_kills_bedwars, bedwars.four_four_deaths_bedwars),
          bedsBroken: bedwars.four_four_beds_broken_bedwars || 0,
          bedsLost: bedwars.four_four_beds_lost_bedwars || 0,
          bblr: func.ratio(bedwars.four_four_beds_broken_bedwars, bedwars.four_four_beds_lost_bedwars),
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
          wlr: func.ratio(bedwars.two_four_wins_bedwars, bedwars.two_four_losses_bedwars),
          finalKills: bedwars.two_four_final_kills_bedwars || 0,
          finalDeaths: bedwars.two_four_final_deaths_bedwars || 0,
          fkdr: func.ratio(bedwars.two_four_final_kills_bedwars, bedwars.two_four_final_deaths_bedwars),
          kills: bedwars.two_four_kills_bedwars || 0,
          deaths: bedwars.two_four_deaths_bedwars || 0,
          kdr: func.ratio(bedwars.two_four_kills_bedwars, bedwars.two_four_deaths_bedwars),
          bedsBroken: bedwars.two_four_beds_broken_bedwars || 0,
          bedsLost: bedwars.two_four_beds_lost_bedwars || 0,
          bblr: func.ratio(bedwars.two_four_beds_broken_bedwars, bedwars.two_four_beds_lost_bedwars),
          iron: bedwars.two_four_iron_resources_collected_bedwars || 0,
          gold: bedwars.two_four_gold_resources_collected_bedwars || 0,
          diamond: bedwars.two_four_diamond_resources_collected_bedwars || 0,
          emerald: bedwars.two_four_emerald_resources_collected_bedwars || 0
      }
  })

}





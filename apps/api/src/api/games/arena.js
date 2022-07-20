
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const arena = hypixel.stats.Arena || {}
    const achievements = hypixel.achievements || {}
    
    let abrating = {null: 0}
    let abposition = {null: "unknown"}
    Object.keys(arena).forEach(n=>{
      if (n.includes("_arena_rating_") && n.endsWith("rating")) abrating[n] = arena[n]
      if (n.includes("_arena_rating_") && n.endsWith("position")) abposition[n] = arena[n]
    })
    let abhighestpos = Object.entries(abposition).reduce((a, b) => a[1] < b[1] ? a : b)[0] || 0
    let abhighestrt = Object.entries(abrating).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 0


    let overall_arena_losses = (arena.losses_1v1 || 0) + (arena.losses_2v2 || 0) + (arena.losses_4v4 || 0)
    let overall_arena_kills = (arena.kills_1v1 || 0) + (arena.kills_2v2 || 0) + (arena.kills_4v4 || 0)
    let overall_arena_deaths = (arena.deaths_1v1 || 0) + (arena.deaths_2v2 || 0) + (arena.deaths_4v4 || 0)
    let overall_arena_winstreak = (arena.win_streaks_1v1 || 0) + (arena.win_streaks_2v2 || 0) + (arena.win_streaks_4v4 || 0)
    return ({
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
            wlr: func.ratio(arena.wins, overall_arena_losses) || 0,
            kills: overall_arena_kills,
            deaths: overall_arena_deaths,
            kdr: func.ratio(overall_arena_kills, overall_arena_deaths) || 0,
            winstreak: overall_arena_winstreak,
        },
        solo: {
            wins: arena.wins_1v1 || 0,
            losses: arena.losses_1v1 || 0,
            winstreak: arena.win_streaks_1v1 || 0,
            wlr: func.ratio(arena.wins_1v1, arena.losses_1v1) || 0,
            kills: arena.kills_1v1 || 0,
            deaths: arena.deaths_1v1 || 0,
            kdr: func.ratio(arena.kills_1v1, arena.deaths_1v1) || 0,
        },
        doubles: {
            wins: arena.wins_2v2 || 0,
            losses: arena.losses_2v2 || 0,
            winstreak: arena.win_streaks_2v2 || 0,
            wlr: func.ratio(arena.wins_2v2, arena.losses_2v2) || 0,
            kills: arena.kills_2v2 || 0,
            deaths: arena.deaths_2v2 || 0,
            kdr: func.ratio(arena.kills_2v2, arena.deaths_2v2) || 0,
        },
        fours: {
            wins: arena.wins_4v4 || 0,
            losses: arena.losses_4v4 || 0,
            winstreak: arena.win_streaks_4v4 || 0,
            wlr: func.ratio(arena.wins_4v4, arena.losses_4v4) || 0,
            kills: arena.kills_4v4 || 0,
            deaths: arena.deaths_4v4 || 0,
            kdr: func.ratio(arena.kills_4v4, arena.deaths_4v4) || 0,
        }
    })

}





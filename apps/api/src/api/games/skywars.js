
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const skywars = hypixel.stats.SkyWars || {};
    const achievements = hypixel.achievements || {}

    modes = {
      skywars_solo_normal: skywars.wins_solo_normal || 0,
      skywars_solo_insane: skywars.wins_solo_insane || 0,
      skywars_teams_normal: skywars.wins_team_normal || 0,
      skywars_teams_insane: skywars.wins_team_insane || 0,
      skywars_ranked: skywars.wins_ranked || 0,
      skywars_normalmega: skywars.wins_mega || 0,
      skywars_doublesmega: skywars.wins_mega_doubles || 0,
      skywars_lab: skywars.wins_lab || 0,
    }
   
    let sw_main_mode = Object.entries(modes).reduce((a, b) => a[1] > b[1] ? a : b)[0]

    let swrating = {null: 0}
    let swposition = {null: "unknown"}
    Object.keys(skywars).forEach(n=>{
      if (n.includes("_skywars_rating_") && n.endsWith("rating")) swrating[n] = skywars[n]
      if (n.includes("_skywars_rating_") && n.endsWith("position")) swposition[n] = skywars[n]
    })
    let swhighestpos = Object.entries(swposition).reduce((a, b) => a[1] < b[1] ? a : b)[0] || 0
    let swhighestrt = Object.entries(swrating).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 0

    
    return ({
      levelformatted: func.clear(skywars.levelFormatted || "1⋆"),
      level: func.getSwLevel(skywars.skywars_experience || 0),
      coins: skywars.coins || 0,
      souls: skywars.souls || 0,
      shards: skywars.shard || 0,
      shardsp: func.f((skywars.shard || 0) / 200, "", 2),
      heads: skywars.heads || 0,
      tokens: skywars.cosmetic_tokens || 0,
      opals: skywars.opals || 0,
      expmilestone: func.getSwExpLeft(skywars.skywars_experience || 0),
      rawplaytime: skywars.time_played || 0,
      playtime: func.toTime(skywars.time_played || 0).h,
      main_mode: func.getGamemode(sw_main_mode),
      overall: {
        wins: skywars.wins || 0,
        losses: skywars.losses || 0,
        wlr: func.ratio(skywars.wins, skywars.losses),
        games: skywars.games_played_skywars || 0,
        kills: skywars.kills || 0,
        deaths: skywars.deaths || 0,
        kdr: func.ratio(skywars.kills, skywars.deaths),
        playtime: func.toTime(skywars.time_played || 0).h,
        rawplaytime: skywars.time_played || 0,
        assists: skywars.assists || 0
      },
      solo_normal: {
        wins: skywars.wins_solo_normal || 0,
        losses: skywars.losses_solo_normal || 0,
        wlr: func.ratio(skywars.wins_solo_normal, skywars.losses_solo_normal),
        kills: skywars.kills_solo_normal || 0,
        deaths: skywars.deaths_solo_normal || 0,
        kdr: func.ratio(skywars.kills_solo_normal, skywars.deaths_solo_normal),
        games: skywars.games_solo || 0,
        playtime: func.toTime(skywars.time_played_solo || 0).h,
        rawplaytime: skywars.time_played_solo || 0,
        assists: skywars.assists_solo || 0
      },
      solo_insane: {
        wins: skywars.wins_solo_insane || 0,
        losses: skywars.losses_solo_insane || 0,
        wlr: func.ratio(skywars.wins_solo_insane, skywars.losses_solo_insane),
        kills: skywars.kills_solo_insane || 0,
        deaths: skywars.deaths_solo_insane || 0,
        kdr: func.ratio(skywars.kills_solo_insane, skywars.deaths_solo_insane),
        games: skywars.games_solo || 0,
        playtime: func.toTime(skywars.time_played_solo || 0).h,
        rawplaytime: skywars.time_played_solo || 0,
        assists: skywars.assists_solo || 0
      },
      team_normal: {
        wins: skywars.wins_team_normal || 0,
        losses: skywars.losses_team_normal || 0,
        wlr: func.ratio(skywars.wins_team_normal, skywars.losses_team_normal),
        kills: skywars.kills_team_normal || 0,
        deaths: skywars.deaths_team_normal || 0,
        kdr: func.ratio(skywars.kills_team_normal, skywars.deaths_team_normal),
        games: skywars.games_team || 0,
        playtime: func.toTime(skywars.time_played_team || 0).h,
        rawplaytime: skywars.time_played_team || 0,
        assists: skywars.assists_team || 0
      },
      team_insane: {
        wins: skywars.wins_team_insane || 0,
        losses: skywars.losses_team_insane || 0,
        wlr: func.ratio(skywars.wins_team_insane, skywars.losses_team_insane),
        kills: skywars.kills_team_insane || 0,
        deaths: skywars.deaths_team_insane || 0,
        kdr: func.ratio(skywars.kills_team_insane, skywars.deaths_team_insane),
        games: skywars.games_team || 0,
        playtime: func.toTime(skywars.time_played_team || 0).h,
        rawplaytime: skywars.time_played_team || 0,
        assists: skywars.assists_team || 0
      },
      ranked: {
        wins: skywars.wins_ranked || 0,
        losses: skywars.losses_ranked || 0,
        wlr: func.ratio(skywars.wins_ranked, skywars.losses_ranked),
        kills: skywars.kills_ranked || 0,
        deaths: skywars.deaths_ranked || 0,
        kdr: func.ratio(skywars.kills_ranked, skywars.deaths_ranked),
        games: skywars.games_ranked || 0,
        playtime: func.toTime(skywars.time_played_ranked || 0).h,
        rawplaytime: skywars.time_played_ranked || 0,
        assists: skywars.assists_ranked || 0,
        rating: swrating || 0,
        position: swposition || 0,
        highestrt: swrating[swhighestrt] || 0,
        highestpos: swposition[swhighestpos] || null,
      }
    })

}





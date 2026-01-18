
const { ratio } = require('../ApiFunctions');
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const tnt = hypixel.stats.TNTGames || {};
    const achievements = hypixel.achievements || {}
   
    return ({
      coins: tnt.coins || 0,
      winstreak: tnt.winstreak || 0,
      blocksran: achievements.tntgames_block_runner || 0,
      rawplaytime: achievements.tntgames_tnt_triathlon || 0,
      playtime: func.toTime(achievements.tntgames_tnt_triathlon || 0).m,
      overall: {
        wins: tnt.wins || 0,
        kills: (tnt.kills_tntag || 0)+(tnt.kills_capture || 0)+(tnt.kills_pvprun || 0),
        deaths: (tnt.deaths_pvprun || 0)+(tnt.deaths_tntrun || 0)+(tnt.deaths_capture || 0)+(tnt.deaths_bowspleef || 0)+(tnt.deaths_tntag || 0),
        kdr: ratio((tnt.kills_tntag || 0)+(tnt.kills_capture || 0)+(tnt.kills_pvprun || 0), (tnt.deaths_pvprun || 0)+(tnt.deaths_tntrun || 0)+(tnt.deaths_capture || 0)+(tnt.deaths_bowspleef || 0)+(tnt.deaths_tntag || 0)),
        assists: tnt.assists_capture || 0,
      },
      wizards: {
        wins: tnt.wins_capture || 0,
        kills: tnt.kills_capture || 0,
        deaths: tnt.deaths_capture || 0,
        kdr: ratio(tnt.kills_capture || 0, tnt.deaths_capture || 0),
        assists: tnt.assists_capture || 0,
        points: tnt.points_capture || 0,
      },
      tntrun: {
        wins: tnt.wins_tntrun || 0,
        deaths: tnt.deaths_tntrun || 0,
        wlr: ratio(tnt.wins_tntrun || 0, tnt.deaths_tntrun || 0),
        rawrecord: tnt.record_tntrun || 0,
        record: func.toTime(tnt.record_tntrun || 0).miniformatted
      },
      pvprun: {
        wins: tnt.wins_pvprun || 0,
        wlr: ratio(tnt.wins_pvprun || 0, tnt.deaths_pvprun || 0),
        kills: tnt.kills_pvprun || 0,
        deaths: tnt.deaths_pvprun || 0,
        kdr: ratio(tnt.kills_pvprun || 0, tnt.deaths_pvprun || 0),
        rawrecord: tnt.record_pvprun || 0,
        record: func.toTime(tnt.record_pvprun || 0).miniformatted
      },
      tnttag: {
        wins: tnt.wins_tntag || 0,
        wlr: ratio(tnt.wins_tntag || 0, tnt.deaths_tntag || 0),
        kills: tnt.kills_tntag || 0,
        deaths: tnt.deaths_tntag || 0,
        kdr: ratio(tnt.kills_tntag || 0, tnt.deaths_tntag || 0),
        tagged: achievements.tntgames_clinic || 0,
      },
      bowspleef: {
        wins: tnt.wins_bowspleef || 0,
        deaths: tnt.deaths_bowspleef || 0,
        wlr: ratio(tnt.wins_bowspleef || 0, tnt.deaths_bowspleef || 0),
        shots: tnt.tags_bowspleef || 0,
      }
    })

}





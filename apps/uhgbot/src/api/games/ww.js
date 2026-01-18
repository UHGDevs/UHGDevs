
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const ww = hypixel.stats.WoolGames || {};
    const achievements = hypixel.achievements || {}

    let wwexpand = ww.wool_wars || {}
    let wwstats = wwexpand.stats || {}
    let wwprogress = ww.progression || {}
    let wwclasses = wwstats.classes || {archer: {}, assault: {}, swordsman: {}, tank: {}, golem: {}, engineer: {}}

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
   
    return ({
      coins: ww.coins || 0,
      xp: wwprogress.experience || 0,
      level: func.getWwLevel(wwprogress.experience || 0).level,
      levelxpleft: func.getWwLevel(wwprogress.experience || 0).xpleft,
      levelformatted: func.getWwLevel(wwprogress.experience || 0).levelformatted,
      layers: wwprogress.available_layers || 0,
      games: wwstats.games_played || 0,
      wins: wwstats.wins || 0,
      losses: (wwstats.games_played || 0)-(wwstats.wins || 0),
      wlr: func.ratio(wwstats.wins || 0, (wwstats.games_played || 0)-(wwstats.wins || 0)),
      kills: wwstats.kills || 0,
      deaths: wwstats.deaths || 0,
      kdr: func.ratio(wwstats.kills || 0, wwstats.deaths || 0),
      assists: wwstats.assists || 0,
      blocks_broken: wwstats.blocks_broken || 0,
      blocks_placed: wwstats.wool_placed || 0,
      blocks: (wwstats.blocks_broken || 0) + (wwstats.wool_placed || 0),
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
    })

}





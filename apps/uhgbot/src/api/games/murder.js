
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const murder = hypixel.stats.MurderMystery || {};
    const achievements = hypixel.achievements || {};

    const modes = {
      murder_classic: murder.games_MURDER_CLASSIC || 0,
      murder_double_up: murder.games_MURDER_DOUBLE_UP || 0,
      murder_showdown: murder.games_MURDER_SHOWDOWN || 0,
      murder_infection: murder.games_MURDER_INFECTION || 0,
      murder_hardcore: murder.games_MURDER_HARDCORE || 0,
      murder_assassins: murder.games_MURDER_ASSASSINS || 0,
    }
   
    let murder_main_mode = Object.entries(modes).reduce((a, b) => a[1] > b[1] ? a : b)[0]

    return ({
      coins: murder.coins || 0,
      murdererwins: murder.murderer_wins || 0,
      detectivewins: murder.detective_wins || 0,
      herowins: murder.was_hero || 0,
      main_mode: func.getGamemode(murder_main_mode),
      overall: {
        games: murder.games || 0,
        wins: murder.wins || 0,
        kills: murder.kills || 0,
        losses: murder.games-murder.wins || 0,
        deaths: murder.deaths || 0,
        wlr: func.ratio(murder.wins, murder.games-murder.wins) || 0,
        kdr: func.ratio(murder.kills, murder.deaths) || 0,
      },
      classic: {
        games: murder.games_MURDER_CLASSIC || 0,
        wins: murder.wins_MURDER_CLASSIC || 0,
        kills: murder.kills_MURDER_CLASSIC || 0,
        losses: murder.games_MURDER_CLASSIC-murder.wins_MURDER_CLASSIC || 0,
        deaths: murder.deaths_MURDER_CLASSIC || 0,
        wlr: func.ratio(murder.wins_MURDER_CLASSIC, murder.games_MURDER_CLASSIC-murder.wins_MURDER_CLASSIC) || 0,
        kdr: func.ratio(murder.kills_MURDER_CLASSIC, murder.deaths_MURDER_CLASSIC) || 0,
      },
      doubleup: {
        games: murder.games_MURDER_DOUBLE_UP || 0,
        wins: murder.wins_MURDER_DOUBLE_UP || 0,
        kills: murder.kills_MURDER_DOUBLE_UP || 0,
        losses: murder.games_MURDER_DOUBLE_UP-murder.wins_MURDER_DOUBLE_UP || 0,
        deaths: murder.deaths_MURDER_DOUBLE_UP || 0,
        wlr: func.ratio(murder.wins_MURDER_DOUBLE_UP, murder.games_MURDER_DOUBLE_UP-murder.wins_MURDER_DOUBLE_UP) || 0,
        kdr: func.ratio(murder.kills_MURDER_DOUBLE_UP, murder.deaths_MURDER_DOUBLE_UP) || 0,
      },
      assassins: {
        games: murder.games_MURDER_ASSASSINS || 0,
        wins: murder.wins_MURDER_ASSASSINS || 0,
        kills: murder.kills_MURDER_ASSASSINS || 0,
        losses: murder.games_MURDER_ASSASSINS-murder.wins_MURDER_ASSASSINS || 0,
        deaths: murder.deaths_MURDER_ASSASSINS || 0,
        wlr: func.ratio(murder.wins_MURDER_ASSASSINS, murder.games_MURDER_ASSASSINS-murder.wins_MURDER_ASSASSINS) || 0,
        kdr: func.ratio(murder.kills_MURDER_ASSASSINS, murder.deaths_MURDER_ASSASSINS) || 0,
      },
      infection: {
        games: murder.games_MURDER_INFECTION || 0,
        wins: murder.wins_MURDER_INFECTION || 0,
        survivorwins: murder.survivor_wins_MURDER_INFECTION || 0,
        kills: murder.kills_MURDER_INFECTION || 0,
        losses: murder.games_MURDER_INFECTION-murder.wins_MURDER_INFECTION || 0,
        deaths: murder.deaths_MURDER_INFECTION || 0,
        wlr: func.ratio(murder.wins_MURDER_INFECTION, murder.games_MURDER_INFECTION-murder.wins_MURDER_INFECTION) || 0,
        kdr: func.ratio(murder.kills_MURDER_INFECTION, murder.deaths_MURDER_INFECTION) || 0,
      }
    })

}





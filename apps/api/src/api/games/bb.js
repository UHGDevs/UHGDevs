
const func = require('../../util/ApiFunctions');

module.exports = (hypixel) => {
    const bb = hypixel.stats.BuildBattle || {}
    const achievements = hypixel.achievements || {}
    
    return ({
        score: bb.score || 0,
        title: func.getBuildBattle(bb.score || 0),
        coins: bb.coins || 0,
        overall: {
          wins: bb.wins || 0,
          games: bb.games_played || 0
        },
        guess: {
          wins: bb.wins_guess_the_build || 0,
          guesses: bb.correct_guesses || 0,
        }
    })

}





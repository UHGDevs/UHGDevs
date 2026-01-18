
const func = require('../ApiFunctions');

module.exports = (hypixel) => {
    const tkr = hypixel.stats.GingerBread || {};
    const achievements = hypixel.achievements || {}

    let tkrrating = {null: 0}
    let tkrposition = {null: "unknown"}
    Object.keys(tkr).forEach(n=>{
      if (n.startsWith("GingerBread_tkr_points_") && n.endsWith("points")) tkrrating[n] = tkr[n]
      if (n.startsWith("GingerBread_tkr_points_") && n.endsWith("position")) tkrposition[n] = tkr[n]
    })
    let tkrhighestpos = Object.entries(tkrposition).reduce((a, b) => a[1] < b[1] ? a : b)[0] || 0
    let tkrhighestrt = Object.entries(tkrrating).reduce((a, b) => a[1] > b[1] ? a : b)[0] || 0

   
    return ({
        coins: tkr.coins || 0,
        games: achievements.gingerbread_racer || 0,
        trophies: tkr.wins || 0,
        losses: (achievements.gingerbread_racer || 0)-(tkr.wins || 0),
        trophyratio: (tkr.wins || 0)/((achievements.gingerbread_racer || 0)-(tkr.wins || 0)) || 0,
        bronze: tkr.bronze_trophy || 0,
        silver: tkr.silver_trophy || 0,
        gold: tkr.gold_trophy || 0,
        wlr: (tkr.gold_trophy || 0)/((achievements.gingerbread_racer || 0)-(tkr.gold_trophy || 0)) || 0,
        grandprixtokens: tkr.grand_prix_tokens || 0,
        collectedboxes: tkr.box_pickups || 0,
        collectedcoins: tkr.coins_picked_up || 0,
        laps: tkr.laps_completed || 0,
        bananahits: tkr.banana_hits_received || 0,
        highestpos: tkr[tkrhighestpos] || 0,
        highestrt: tkr[tkrhighestrt] || 0,
        wins: tkr.gold_trophy || 0
    })

}





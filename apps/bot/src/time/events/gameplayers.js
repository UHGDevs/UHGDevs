const time = require('../../utils/timehandler.js')
const send = require('../../minecraft/send').send;

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Automatické kontrolování minihry jestli splňuje požadavky pro start",
  emoji: '👥',
  time: '0 * * * * *', //'*/10 * * * * *'
  ignore: '* * 0,23 * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg) => {
    let date = new Date()
    let event = time.start(uhg, eventName)
    try {

        /* DOČASTNÝ BOT ONLINE CHECK */
        if (uhg.settings.minecraft) {
          let botOnApi = await uhg.api.call('fb811b92561e434eb5b6ef04695cc49a', ['online'])
          if (botOnApi.success) {
            if (!botOnApi.online.online) {
              uhg.restartbot()
              uhg.dc.client.channels.cache.get('548772550386253824').send({ content: `ONLINE CHECK RESTART` })
            }
          } else uhg.dc.client.channels.cache.get('548772550386253824').send({ content: `ERROR V API - online check` })
        }


        let gameplayers = await uhg.mongo.run.get("general", "uhg")
        gameplayers = gameplayers.filter(n => n.gameplayers ? n.gameplayers.toggle == true : n.gameplayers)
        if (!gameplayers) return

        let game;
        let gamemode;
        let req;
        let player;
        let discord;

        for (let i in gameplayers) {
          if (!gameplayers[i].gameplayers) return
          game = gameplayers[i].gameplayers.game
          gamemode = gameplayers[i].gameplayers.gamemode
          req = gameplayers[i].gameplayers.req
          player = gameplayers[i].username
          discord = gameplayers[i]._id

          if (!game || !req || !player) continue
        
        let api = await uhg.api.call("1afa0f55eb264065846b912c3397ab78", ["gamecounts"]);
        if (!api.success) return;

        let fullgame;

        if (gamemode && api.gamecounts.games[game][gamemode] >= req) {
          fullgame = `${game} ${gamemode}`
        }
        else if (!gamemode && game && api.gamecounts.games[game] >= req) {
          fullgame = game
        }
        if (fullgame) {
            send(uhg, {send:`/msg ${player} Hra ${fullgame} již obsahuje požadovaný počet hráčů, a to ${req} ('!gameplayers off' pro vypnutí)`})
            if (discord) uhg.dc.client.users.fetch(discord).then(user => {
              user.send(`Hra ${fullgame} již obsahuje požadovaný počet hráčů, a to ${req} ('!gameplayers off' pro vypnutí, v DMs na příkaz nereaguji)`).catch(e => console.log(`Uživatel má vypnuté DMs na Discordu (${discord} ${player})`.bgRed))
            })
            await uhg.delay(600)
          }
      }
        
    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}

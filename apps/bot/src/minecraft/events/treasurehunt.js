let chat = require(`../send.js`)
let bridge = require(`../bridge.js`)
module.exports = async (uhg, pmsg) => {
    let content = pmsg.content.replaceAll("/", "").trim().split(" ")
    if (!content.length || content.length !==4) return
    let x = Number(content[0])
    let y = Number(content[1])
    let z = Number(content[2])
    let c = Number(content[3].replace("#", ""))
    if (x === NaN || y === NaN || z === NaN || c === NaN) return
    else return chat.send(uhg, {send: `/msg ${pmsg.username} Event již skončil`})

    let ignore = ["DavidCzPdy", "Honzu", "unisdynasty"]
    if (ignore.includes(pmsg.username)) return chat.send(uhg, {send: `/msg ${pmsg.username} Nemáš právo soutěžit!`})

    let database = await uhg.mongo.run.get('general', 'treasure', { _id: c })
    if (!database.length) return chat.send(uhg, {send: `/msg ${pmsg.username} obrázek číslo ${c} nebyl nalezen!`})
    database = database[0]

    if (database.winner) {
      let time = uhg.toTime(Number(new Date()) - database.time, true)
      if (time.d >= 1) time = Math.floor(time.d) + "d"
      else if (time.h >= 1) time = Math.floor(time.h) + "h"
      else if (time.m >= 1) time = Math.floor(time.m) + "min"
      else time = Math.floor(time.s) + "s"
      return chat.send(uhg, {send: `/msg ${pmsg.username} obrázek číslo ${c} už byl uhádnut hráčem ${database.winner} před ${time}!`})
    }
    let nameStop = database.names.filter(n => n == pmsg.username)
    if (nameStop.length > 15) return chat.send(uhg, {send: `/msg ${pmsg.username} obrázek číslo ${c} jsi už 15x neuhádl, nejde ho dál hádat!`})

    let coords = `${x} ${y} ${z}`
    if (coords !== database.coords)  {
      chat.send(uhg, {send: `/msg ${pmsg.username} souřadnice ${coords} obr. č. ${c} nejsou správné!`})
      let names = database.names
      names.push(pmsg.username)
      if (coords !== '0 0 0') uhg.mongo.run.update('general', 'treasure', { _id:c }, {guesses: database.guesses += 1, names: names})
      return
    }

    let points = pmsg.verify_data.points_0 || 0
    points += 1
    chat.send(uhg, {send: `/msg ${pmsg.username} Správná odpověď! Počet bodů: ${points}!`})
    chat.send(uhg, {send: `/gc ${pmsg.username} uhádl obrázek č. ${c}! Aktuální počet bodů: **${points}**`})
    bridge.info(uhg, {msg: `**${pmsg.username}** uhádl obrázek č. ${c}! Aktuální počet bodů: **${points}**`})

    uhg.mongo.run.update('general', 'uhg', { username: pmsg.username }, { points_0: points })
    uhg.mongo.run.update('general', 'treasure', { _id:c }, {winner: pmsg.username, time: Number(new Date())})

    try {
      let message = await uhg.dc.client.channels.cache.get('962729811518820382').messages.fetch(database.msgID)
      message.delete()
    } catch (e) {

    }
    return
}

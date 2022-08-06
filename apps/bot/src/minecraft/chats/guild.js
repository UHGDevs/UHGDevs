let bridge = require(`../bridge.js`)
let chat = require(`../send.js`)
let cakes = require('../events/cakes.js')
module.exports = async (uhg, pmsg) => {
  if (pmsg.msg.match(/^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: (.*)$/)) await bridge.chat(uhg, pmsg)
  else await bridge.info(uhg, pmsg)

  if (pmsg.msg.match(/^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])? joined./)) cakes(uhg, pmsg)

  let finder = pmsg.msg.match(/^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: (někdo|nekdo|someone|any|[0-9]\/[0-9]|[0-9]|any1)? (\w{2,10})?(.*)$/i)
  if (finder) guildfinder(uhg, pmsg, finder)

  if (!pmsg.command) return
  let command = uhg.mc.commands.get(pmsg.command)
  if(!command) command = uhg.mc.commands.get(uhg.mc.aliases.get(pmsg.command.toLowerCase()));
  let res = "Neznámý příkaz"
  if (command) res = await command.run(uhg, pmsg);


  pmsg.send = res.mc || res
  await bridge.send(uhg, res)

  await chat.send(uhg, pmsg)
}

async function guildfinder(uhg, pmsg, finder) {
  if (finder[5] && !finder[5].match(/[A-Z]+/gi)) return;
  let user = await uhg.mongo.run.get("general", "guildfind", {_id: pmsg.username}) || {}
  if (user.length) user = user[0]

  let userdata = user.data || []

  let game;
  if (finder[5]) game = uhg.mc.aliases.get(finder[5].toLowerCase()) ||finder[5]

  userdata.push( {game: game || finder[5], message: pmsg.content, time: Number(new Date())} )

  if (userdata.length>1) userdata.sort((a, b) => b.time - a.time);

  let send = []

  let data = await uhg.mongo.run.get("general", "guildfind")
  data.forEach(item => {
    if (item._id == pmsg.username) return
    let same;
    if (game && item.data) { 
      console.log(game)
      console.log(item.data)
      same = item.data.filter(a => a.game.toLowerCase() == game.toLowerCase())
    }

    if (!same) return
    if (!same.length) return
    let time = Math.floor(uhg.toTime(Number(new Date()) - same[0].time, true).m)
    send.push(`[${game}] ${item._id}: - ${time}min ago  -> \"${same[0].message}\"`)
  })

  uhg.mongo.run.post("general", "guildfind", {_id: pmsg.username, data: userdata, discord: pmsg.id, updated: Number(new Date())})

  for (let msg of send) {
    let pemsg = pmsg
    pemsg.send = `/msg ${pemsg.username} ${msg}`
    //bridge.send(uhg, msg)
    await chat.send(uhg, pemsg)
    await uhg.delay(2000)
  }



}

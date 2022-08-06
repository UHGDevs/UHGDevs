let chat = require(`../send.js`)
module.exports = async (uhg, pmsg) => {
  if (!pmsg.command) return "neni command"

  if (pmsg.command == "sniped") {
    let sniped = uhg.snipe.get(uhg.snipe.find(n=>n.notify==pmsg.username).username)
    if (!sniped) return chat.send(uhg, {send: `/msg ${pmsg.username} neexistuje`})
    sniped.sniped = true
    uhg.snipe.set(sniped.username, sniped)
    return chat.send(uhg, {send: `/msg ${pmsg.username} noted`})
  }
  if (pmsg.command == "sniper" && pmsg.args && pmsg.args.split(" ")[0]=="stop") {
    let sniped = uhg.snipe.get(uhg.snipe.find(n=>n.notify==pmsg.username).username)
    if (!sniped) return
    uhg.snipe.delete(sniped.username)
    return chat.send(uhg, {send: `/msg ${pmsg.username} stopped`})
  } else if (pmsg.command == "sniper" && pmsg.args && pmsg.args.split(" ")[0]=="resume") {
    let sniped = uhg.snipe.get(uhg.snipe.find(n=>n.notify==pmsg.username).username)
    if (!sniped) return chat.send(uhg, {send: `/msg ${pmsg.username} neexistuje žádná session`})
    sniped.sniped = false
    uhg.snipe.set(sniped)
    return chat.send(uhg, {send: `/msg ${pmsg.username} resumed`})
  }

  let command = uhg.mc.commands.get(pmsg.command)
  if(!command) command = uhg.mc.commands.get(uhg.mc.aliases.get(pmsg.command.toLowerCase()));
  let res = ''
  if (command) res = await command.run(uhg, pmsg)
  if (res) pmsg.send = res.mc || res
  if (pmsg.send) await chat.send(uhg, pmsg)
}

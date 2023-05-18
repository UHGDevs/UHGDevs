let bridge = require(`../bridge.js`)
let chat = require(`../send.js`)
module.exports = async (uhg, pmsg) => {
  if (pmsg.msg.match(/^Officer > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: (.*)$/)) await bridge.chat(uhg, pmsg)
  else if (pmsg.event != "grequest") await bridge.info(uhg, pmsg)

  if (pmsg.event === "grequest") return require("../events/getjoined.js")(uhg, pmsg)
  if (pmsg.command) {
    let commands = uhg.commands.filter(n => n.platform == 'mc')
    let command = commands.get(pmsg.command) || commands.get(this.uhg.aliases.get(pmsg.command))
    let res = "Neznámý příkaz"
    if (command) res = await command.run(uhg, pmsg);
    pmsg.send = res.mc || res
    await bridge.send(uhg, res, "Officer")
    await chat.send(uhg, pmsg)
  }
}

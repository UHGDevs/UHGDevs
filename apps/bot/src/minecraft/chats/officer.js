let bridge = require(`../bridge.js`)
let chat = require(`../send.js`)
module.exports = async (uhg, pmsg) => {
  if (pmsg.msg.match(/^Officer > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: (.*)$/)) await bridge.chat(uhg, pmsg)
  else if (pmsg.event != "grequest") await bridge.info(uhg, pmsg)

  if (pmsg.event === "grequest") return require("../events/getjoined.js")(uhg, pmsg)
  if (pmsg.command) {
    let command = uhg.mc.commands.get(pmsg.command)
    if(!command) command = uhg.mc.commands.get(uhg.mc.aliases.get(pmsg.command.toLowerCase()));
    let res = "Neznámý příkaz"
    if (command) res = await command.run(uhg, pmsg);
    pmsg.send = res.mc || res
    await bridge.send(uhg, res, "Officer")
    await chat.send(uhg, pmsg)
  }
}

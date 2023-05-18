
module.exports = async (uhg, pmsg) => {
  if (!pmsg.command) return "neni command"

  let commands = uhg.commands.filter(n => n.platform == 'mc')
  let command = commands.get(pmsg.command) || commands.get(this.uhg.aliases.get(pmsg.command))
  let res = ''
  if (command) res = await command.run(uhg, pmsg)
  if (res) pmsg.send = res.mc || res
  //if (pmsg.send) await chat.send(uhg, pmsg)
  
}

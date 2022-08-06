let bridge = require(`../bridge.js`)
module.exports = async (uhg, pmsg) => {
  console.log("ELSE")
  console.log(pmsg.msg)
  console.log(pmsg)
  //if (pmsg.msg.match(/^Guild > (\[.*]\s*)?([\w]{2,17}).*?(\[.{1,15}])?: (.*)$/)) await bridge.chat(uhg, pmsg)
  //else await bridge.info(uhg, pmsg)
}

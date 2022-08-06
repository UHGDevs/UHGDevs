exports.chat = async function (uhg, pmsg) {
  let channel;
  let msg = await pings(pmsg.content, uhg)
  if (pmsg.channel==="Officer" || pmsg.channel==="/go") channel = uhg.dc.cache.channels.get("officer")
  else channel = uhg.dc.cache.channels.get("guild")
  if (!channel) return console.log("Nenašel se kanál (bridge.js)")
  await channel.send(((getEmoji(uhg.dc.client, pmsg.rank||"non", pmsg.pluscolor)) + " **" + pmsg.username + ":** " +msg).trim())
  return
}

exports.info = async function (uhg, pmsg, mcchannel="Guild") {
  let channel;
  let semoji = await getEmoji(uhg.dc.client, "server")
  if (mcchannel==="Officer") channel = uhg.dc.cache.channels.get("officer")
  else channel = uhg.dc.cache.channels.get("guild")
  let msg = pmsg.msg
  if (msg.startsWith(`${pmsg.channel} >`)) msg = pmsg.msg.replace(`${pmsg.channel} >`, semoji)
  else msg = semoji + msg
  if (msg.endsWith(`${pmsg.username} joined.`)) msg = msg.replace(pmsg.username + " joined.", `\`${pmsg.username} joined.\``)
  else if (msg.endsWith(`${pmsg.username} left.`)) msg = msg.replace(pmsg.username + " left.", `\`${pmsg.username} left.\``)
  await channel.send(msg)

  if (pmsg.msg.endsWith(`${pmsg.username} joined.`) && uhg.data.unverified && uhg.data.unverified.filter(n=>n.name == pmsg.username).length) {
    let send = `/msg ${pmsg.username} Připoj se prosím na discord a verifikuj se - http://dsc.gg/uhg`
    require("./send").send(uhg, {send: send, onetime: true})
  }
  return
}

exports.send = async function (uhg, msg, chnl="Guild") {
  let channel;
  let semoji = await getEmoji(uhg.dc.client, "server")
  if (chnl==="Officer") channel = uhg.dc.cache.channels.get("officer")
  else channel = uhg.dc.cache.channels.get("guild")
  if (!channel) return console.log("Nenašel se kanál (bridge.js)")
  if (typeof msg == 'object') channel.send({ embeds: [msg.dc] })
  else channel.send({ content: semoji + msg })
  return
}

exports.guildjoin = async function (uhg, pmsg) {
  let channel = uhg.dc.cache.channels.get("officer")
    if (!channel) return console.log("Nenašel se kanál (bridge.js)")
  let semoji = await getEmoji(uhg.dc.client, "server")
  let msg = await channel.send({ content:semoji + pmsg.send, components: [pmsg.buttons] })
  msg.expire = Number(new Date()) + 60000
  msg.pmsg = pmsg
  uhg.cache.guildjoin.set(pmsg.username, msg)
  return
}



async function pings(message, uhg) {
  let data = uhg.data.verify
  if (!data.length) data = await uhg.mongo.run.get("general", "verify")
  let mentions = []
  let msg = message
  if (msg.includes("<@&")) msg = msg.replace(/<@&/gi, "")
  if (msg.includes("@")) for (let n=0; n<msg.split(" ").length;n++) if (msg.split(" ")[n].match(/@.*/)) mentions.push(msg.split(" ")[n].substring(1))
  mentions.forEach(men =>{
    let user = data.filter(n=>n.nickname.toLowerCase() == men.toLowerCase())
    if (!user.length) return
    msg = msg.replace(`@${men}`, `<@${user[0]._id}>`)
  })
  return msg
}


function getEmoji(client, emoji, barva="c") {
  let emojis = []
  let em;
  let g = ""
  if (emoji == "server") {
    g = "_ _ _ _ _ _"
    em = ["server1", "server2", "server3", "server4", "server5"]
  }
  else if (emoji == "[MVP++]") {
    let color = barva.replace("§", "")
    em = ["gmvp1", "gmvp2", `gmvp_${color}_1`, `gmvp_${color}_2`]
    g = "_ _ _ _ _ _"
  }
  else if (emoji == "[MVP+]") {
    color = barva.replace("§", "")
    em = ["mvp1", "mvp2", "mvp3", `mvp_${color}`]
    g = "_ _"
  } else if (emoji == "[MVP]") {
    g = "_ _ _ _ _ _"
    em =  ["mvp1b", "mvp2b", "mvp3b"]
  } else if (emoji == "[VIP+]") {
    g = "_ _ _ _ _ _ _ _"
    em = ["vip1p", "vip2p", "vip3p"]
  } else if (emoji == "[VIP]") {
    g = "_ _ _ _"
    em = ["vip1", "vip2", "vip3"]
  } else if (emoji == "non") return "_ _ _ _ _ _ _ _"
  else if (emoji == "[YOUTUBE]") {
    //g = "_ _ _ _"
    em = ["yt1", "yt2", "yt3", "yt4", "yt5"]
  }
  else em = [emoji].filter(n=>n)
  for (let i=0;i<em.length;i++) {
    emojis.push(client.emojis.cache.find(emoji => emoji.name === em[i]))
  }

  return g+emojis.join("")
}

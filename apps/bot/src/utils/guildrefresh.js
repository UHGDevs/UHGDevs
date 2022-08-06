
module.exports = async (uhg, guildname, names=false, games=false) => {
  let gmaster;
  if (guildname.toLowerCase() == "uhg" || guildname.toLowerCase() == "ultimatehypixelguild") gmaster = "64680ee95aeb48ce80eb7aa8626016c7"
  else if (guildname.toLowerCase() == "tkjk") gmaster = "574bfb977d4c475b8197b73b15194a2a"
  else if (guildname.toLowerCase() == "czsk" || guildname.toLowerCase() == "czech team") gmaster = "5d6bfd8fb417488d9cee97a9a4d5f8e7"
  if (!gmaster) return

  let api = await uhg.getApi(gmaster, ["guild"])
  if (api instanceof Object == false) return console.log(api)
  api = api.guild.all

  let today = Object.keys(api.members[0].expHistory)[0]
  let yesterday = Object.keys(api.members[0].expHistory)[1]

  let find = await uhg.mongo.run.get("stats", "guild")
  uhg.data.guild = find
  find = find.filter(n => n._id == api._id)
  if (!find.length) return

  let update = find[0]

  update.updated = Number(new Date())
  update.totalxp = api.exp
  update.tdailyxp[today] = api.exp
  update.dailyxp[today] = api.exp-update.tdailyxp[yesterday]

  let gmembers = []

  for (let member of api.members) {
    gmembers.push(member.uuid)
    let uuid = member.uuid
    let joined = member.joined
    let wexp = member.expHistory

    let ileft = Object.values(update.left).findIndex(i => i.uuid === uuid)
    let imem = update.members.findIndex(i => i.uuid === uuid)
    if (ileft>0) {
      let cache = update.left[ileft]
      cache.exp.daily = Object.assign({}, wexp, cache.exp.daily, wexp)
      update.members.push(cache)
      update.left.splice(ileft,1)
    } else if (imem<0) {
      let mjg = await uhg.getApi(uuid, ["mojang"])
      let nickname = mjg.username
      update.members.push({uuid: uuid, name: nickname, joined: member.joined, exp: {daily: wexp}, games:{daily: {}, total: {}}})
    } else {
      update.members[imem].exp.daily = Object.assign({}, wexp, update.members[imem].exp.daily, wexp);
      if (!update.members[imem].games) update.members[imem].games = {daily: {}, total: {}}

      if (games) {
        let gapi = await uhg.getApi(uuid, ["key", "hypixel"])
        if (gapi.key.uses > 50) await uhg.delay(1000)
        let wins = gapi.hypixel.stats.wins.total
        if (!update.members[imem].games.total[yesterday]) update.members[imem].games.total[yesterday] = wins
        update.members[imem].games.total[today] = wins
        update.members[imem].games.daily[today] =  wins - update.members[imem].games.total[yesterday] || 0
        uhg.mongo.run.update("stats", "stats", gapi.hypixel, false)
      }
    }

    if (names) {
      let mjg = await uhg.getApi(uuid, ["mojang"])
      let nickname;
      if (typeof mjg === 'object') nickname = mjg.username || null
      if (nickname) update.members[imem].name = nickname
    }
  }

  for (let i=0;i<update.members.length;i++) {
    let uuid = update.members[i].uuid
    if (!gmembers.includes(uuid)) {
      update.left.push(update.members[i])
      update.members.splice(i,1)
    }
  }

  if (names) {
    for (let i=0; i<update.left.length;i++) {
      let uuid = update.left[i].uuid
      let mjg = await uhg.getApi(uuid, ["mojang"])
      let nickname;
      if (typeof mjg === 'object') nickname = mjg.username || null
      if (nickname) update.left[i].name = nickname
    }
  }

  uhg.mongo.run.update("stats", "guild", {_id:api._id}, update)
  return {data: update, api: api}

}

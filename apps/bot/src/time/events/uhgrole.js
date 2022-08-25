const { skills } = require('../../settings/values/skyblockconstants.js')
const refresh = require('../../utils/serverroles.js')
const time = require('../../utils/timehandler.js')

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Automatická aktualizace rolí na UHG discordu",
  emoji: '🌙',
  time: '30 */5 * * * *', //'*/10 * * * * *'
  ignore: '* * 0,23 * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: false,
  run: async (uhg) => {
    let date = new Date()
    let event = time.start(uhg, eventName)
    try {

      /* -- Fetch databases -- */
      let dVerify = await uhg.mongo.run.get("general", "verify")
      uhg.data.verify = dVerify
      let dUhg = await uhg.mongo.run.get("general", "uhg")
      uhg.data.uhg = dUhg
      let dLoot = await uhg.mongo.run.get('general', 'loot')
      
      /* -- Fetch Guild api of Unisdynasty -- */
      let api = await uhg.api.call("64680ee95aeb48ce80eb7aa8626016c7", ["guild"])
      if (!api.success) throw new Error(api.reason)

      let members = api.guild.members


      /* -- Make sure UHG database is up to date -- */
      let unUuid = []
      let uhgUuids = []
      for (let member of members) {
        uhgUuids.push(member.uuid);
        let vMember = dVerify.filter(n => n.uuid == member.uuid)
        let uMember = dUhg.filter(n => n.uuid == member.uuid)

        if (!vMember.length) unUuid.push(member.uuid);
        else if (!uMember.length) uhg.mongo.run.post("general", "uhg", {_id:vMember[0]._id, username:vMember[0].nickname, uuid: vMember[0].uuid, guildrank: member.rank })
        else if (uMember[0].guildrank != member.rank) uhg.mongo.run.update("general", "uhg", {_id:uMember[0]._id, guildrank: member.rank })
        else if (uMember[0].username != vMember[0].nickname) uhg.mongo.run.update("general", "uhg", {_id:uMember[0]._id, username: vMember[0].nickname })
      }
      dUhg.filter(n => !uhgUuids.includes(n.uuid)).forEach(notuhg => { uhg.mongo.run.delete("general", "uhg", {_id: notuhg._id})});


      /* -- Get UNVERIFIED Guild Members -- */
      unNames = []
      for (let uuid of unUuid) {
        let uApi = await uhg.api.call(uuid, ["hypixel", "guild"])
        if (!uApi.success) {unNames.push({name:uuid}); continue;}
        let joined = Math.floor((new Date().getTime()-uApi.guild.member.joined)/ 86400000)
        unNames.push( {name:uApi.username, joined: joined, date: `<t:${Math.round(uApi.guild.member.joined/1000)}:R>`, lastLogin: uApi.hypixel.lastLogin, lastOnline: `<t:${Math.round(uApi.hypixel.lastLogin/1000)}:R>`, links: uApi.hypixel.links} )
      }
      uhg.data.unverified = unNames


      let cache = uhg.dc.cache.uhgroles

      dcUnVer = []
      verIds = []
      /* Refresh roles on uhg dc */
      let guild = uhg.dc.client.guilds.cache.get("455751845319802880")
      let discordMembers =  await guild.members.fetch()

      for (let member of discordMembers) {
        member = member[1]
        if (member.user.bot) continue;
        let verify = dVerify.find(n => n._id == member.id)
        let uhgD = dUhg.find(n => n._id == member.id) || {}

        console.log(verify)
       // let loot = dLoot.find(n => n._id == member._id)
        
        if (!verify) {
          if (member.roles.cache.get('478816107222925322')) dcUnVer.push(member)
          for (let role of cache) {
            if (role[1].id == '478816107222925322') continue;
            if (member._roles.includes(role[1].id)) try { await member.roles.remove(role[1]) } catch (e) {} // Delete other guild roles
          }
          //await refresh.uhg_refresh(uhg, member, {}, {})
          continue;
        }

        let data = await uhg.mongo.run.get('stats', 'stats', { uuid: verify.uuid })
        if (data.length) {
          data = data[0]
          if (data.username !== verify.nickname || !(verify.nicks && data.nicks.length === verify.names.length)) uhg.mongo.run.update("general", "verify", {_id:verify._id, nickname: data.username, names: data.nicks })
          if (uhgD && uhgD.username && data.username !== uhgD.username) uhg.mongo.run.update("general", "uhg", {_id:verify._id, username: data.username })
        } else {
          //if (uhgD._id) console.log('Přidat '+ verify.nickname + ' do databáze!')
          data = { username: verify.nickname }
        }
        verIds.push(member.id)
        await refresh.uhg_refresh(uhg, member, data, uhgD)
      }


      // for (let member of dcUnVer) {
      //   console.log(member.user.username)
      //   for (let role of member.roles.cache) {
      //     await member.roles.remove(role)
      //     await uhg.delay(500)
      //   }
      // }

      let notInDb = []
      for (let n of dVerify.filter(n => verIds.includes(n._id))) {
        let data = await uhg.mongo.run.get('stats', 'stats', { uuid: n.uuid })
        if (!data.length) { notInDb.push(n); continue}
        if (n.nickname !== data[0].username || !(n.names && n.names.length === data[0].nicks.length)) uhg.mongo.run.update("general", "verify", {_id :n._id,}, { nickname: data[0].username, names: data[0].nicks })
      }

      //notInDb.forEach(n => console.log(n.nickname))

    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}
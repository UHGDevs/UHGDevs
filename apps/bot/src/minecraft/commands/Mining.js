module.exports = {
  name: "Mining",
  aliases: ["mining", "powder", "gemstone", "mithril", "gemstonepowder", "mithrilpowder", "hotm", "heartofthemountain", "nucleus", "crystalnucleus", "scatha", "scathakills", "comms", "commissions", "nucleusruns"],
  type: 'skyblock',
  run: async (uhg, pmsg) => {
    try {
      const f = uhg.f
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname, ["skyblock"], { verify: pmsg.verify_data })
      if (!api.success) return api.reason
      let cute_name = pmsg.args.split(" ")[1]?.toLowerCase()
      let profil = cute_name ? api.skyblock.profiles.find(n => n.name.toLowerCase() == cute_name) : api.skyblock.profiles[0]
      if (!profil) return "Neplatný profil"
      //let message = `Mining: **${api.username}** - HOTM Tier ${profil.member.mining.hotm_tier} | ${f(profil.member.mining.nucleus)} Nucleus Run${profil.member.mining.nucleus == 1 ? '':'s' } | ${f(profil.member.mining.scatha)} Scatha Kill${profil.member.mining.scatha == 1 ? '':'s'} | ${f(profil.member.mining.commissions)} Comission${profil.member.mining.commissions == 1 ? '':'s'} | ${f(profil.member.mining.powder_mithril)} Mithril Powder | ${f(profil.member.mining.powder_gemstone)} Gemstone Powder`
      let cmd = [
        'Mining:**',
        profil.member.skills_api ? ` [${uhg.f(profil.member.skills.mining.level)}]` : null,
        ' ' + api.username + '**',
        ` - HOTM ${profil.member.mining.hotm_tier}`,
        profil.member.mining.nucleus ? ` | ${f(profil.member.mining.nucleus)} Nucleus`: null,
        profil.member.mining.scatha ? ` | ${f(profil.member.mining.scatha)} Scatha`: null,
        profil.member.mining.commissions ? ` | ${f(profil.member.mining.commissions)} Comission${profil.member.mining.commissions == 1 ? '':'s'}`: null,
        profil.member.mining.powder_mithril ? ` | Powder: ${uhg.fPowder(profil.member.mining.powder_mithril)} Mithril`: null,
        profil.member.mining.powder_gemstone ? `, ${uhg.fPowder(profil.member.mining.powder_gemstone)} Gemstone`: null,
        profil.member.collection.gemstone_collection || profil.member.collection.hard_stone ? ' | Collection:' : null,
        profil.member.collection.gemstone_collection ? ` ${uhg.money(profil.member.collection.gemstone_collection)} Gemstone` : null,
        profil.member.collection.gemstone_collection && profil.member.collection.hard_stone ? ',': null,
        profil.member.collection.hard_stone ? ` ${uhg.money(profil.member.collection.hard_stone)} HardStone` : null,
      ].filter(n => n)
      let message = cmd.join('')
      //let message = `Mining:**${profil.member.skills_api ? ` [${uhg.f(profil.member.skills.mining.level)}]`:''} ${api.username}** - HOTM ${profil.member.mining.hotm_tier} | ${f(profil.member.mining.nucleus)} Nucleus | ${f(profil.member.mining.scatha)} Scatha | ${f(profil.member.mining.commissions)} Comission${profil.member.mining.commissions == 1 ? '':'s'} | Powder: ${uhg.money(profil.member.mining.powder_mithril )} Mithril${profil.member.mining.powder_gemstone ? ', ' + uhg.fPowder(profil.member.mining.powder_gemstone) + ' Gemstone': ''} | Collection: ${uhg.fPowder(profil.member.collection.gemstone_collection || 0)} Gemstone${profil.member.collection.hard_stone ? ', ' + uhg.money(profil.member.collection.hard_stone) + ' HardStone' : ''}`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Mining příkazu!"
    }
  }
}

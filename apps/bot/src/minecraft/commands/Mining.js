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

      let message = `Mining: **${api.username}** - HOTM Tier ${profil.member.mining.hotm_tier} | ${f(profil.member.mining.nucleus)} Nucleus Run${profil.member.mining.nucleus == 1 ? '':'s' } | ${f(profil.member.mining.scatha)} Scatha Kill${profil.member.mining.scatha == 1 ? '':'s'} | ${f(profil.member.mining.commissions)} Comission${profil.member.mining.commissions == 1 ? '':'s'} | ${f(profil.member.mining.powder_mithril)} Mithril Powder | ${f(profil.member.mining.powder_gemstone)} Gemstone Powder`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Mining příkazu!"
    }
  }
}

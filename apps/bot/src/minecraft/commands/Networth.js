
module.exports = {
  name: "NetWorth",
  aliases: ["nw", "networth"],
  type: 'skyblock',
  run: async (uhg, pmsg) => {
    try {
      let nickname = pmsg.nickname
      let api = await uhg.api.call(nickname, ["skyblock"], { verify: pmsg.data_verify })
      if (!api.success) return api.reason

      let cute_name = pmsg.args.split(" ")[1]?.toLowerCase()
      let profil = cute_name ? api.skyblock.profiles.find(n => n.name.toLowerCase() == cute_name) : api.skyblock.profiles[0]
      if (!profil) return "Neplatný profil"
      else if (typeof profil.member.networth !== 'object') return profil.member.networth

      if (pmsg.args?.includes(' dev')) {
        let nw = profil.member.networth
        for (let cat in nw.categories) {
          console.log(`${cat} - ${uhg.money(nw.categories[cat].total)}`)
        }
        console.log()
        console.log(nw.categories.wardrobe_inventory.top_items.slice(0, 10))
      }

      let message = `**NetWorth:** **${api.username}** - ${uhg.money(profil.member.networth.total)} (${profil.name})`
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v NetWorth příkazu!"
    }
  }
}

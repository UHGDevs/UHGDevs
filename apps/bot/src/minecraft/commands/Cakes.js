module.exports = {
  name: "Cakes",
  aliases: ["cakes", "cake"],
  run: async (uhg, pmsg) => {
    try{
      console.log(pmsg)
      let args = pmsg.args.split(' ')
      if (!args.length) return '!cakes on|off'

      if (args[0] == 'off') {
        uhg.mongo.run.update('general', 'uhg', { username: pmsg.username }, { cakes: {} })
        return 'Už nebudeš dostávat cakes upozornění'
      } else if (args[0] != 'on') return '!cakes on|off'
      if (args.length < 2) return '!cakes on [profile]'

      let profile = uhg.capitalize(args[1])

      let api = await uhg.getApi(pmsg.username, ["api", "skyblock", "hypixel", "mojang"], ["main"])
      if (api instanceof Object == false) return api
      if (!api.skyblock.main[profile]) return `${profile} je neplatný profil`

      let cakes = api.skyblock.main[profile].cakes
      console.log(cakes)

      let expire;
      if (cakes) {
        for (let cake of cakes) {
          if (!expire || cake.expire_at < expire.expire_at) expire = cake
        }
      }

      if (!expire) expire = {expire_at: Number(new Date())}

      // need some testing
      // když nemá žádný cake nebo jen nějaký

      let message = `Zapínání cakes na profil ${profile}`
      uhg.mongo.run.update('general', 'uhg', { username: pmsg.username }, { cakes: {toggle: true, profile: profile, expire: expire.expire_at} })

      //console.log((expire.expire_at - Number(new Date()))/1000/60/60)
      return message
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v Cakes příkazu!"
    }
  }
}

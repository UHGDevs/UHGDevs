const request = require('request');
const { Collection } = require('discord.js');

module.exports = {
  name: "NetWorth",
  aliases: ["nw", "networth"],
  cache: new Collection(),
  run: async (uhg, pmsg) => {
    try {
      let nickname = pmsg.nickname
      let api = await uhg.getApi(nickname, ["api", "skyblock", "hypixel", "mojang"], ["all"])
      if (api instanceof Object == false) return api
      let sb = api.skyblock.all

      let data;
      let profile = pmsg.args.split(" ")[1]||null
      if (profile) {
        data = sb.profiles.filter(n => n.cute_name.toLowerCase() == profile.toLowerCase())
        if (!data.length) return "Neplatný profil"
        data = data[0]
      } else data = sb.profiles[sb.profiles.length-1]

      let cute_name = data.cute_name
      data = data.members[api.uuid]

      let cache = uhg.mc.commands.get("NetWorth").cache

      let user = cache.get(api.username)
      if (user && user[cute_name]) return user[cute_name].message

      console.log("new one")

      const options = {
          url: 'https://skyblock.acebot.xyz/api/networth/categories',
          json: true,
          body: {data: data}
      };

      let status;
      let result;
      let message = 'error'
      request.post(options, (err, res, body) => {
          if (body.status === 200) success = true
          else success = false
          result = body

          if (!success) {
            message = body.cause + ` (${cute_name})`
            return
          }

          let coins = result.data.networth
          message = `**NetWorth:** **${api.username}** - ${uhg.money(coins)} (${cute_name})`
          return
      });

      let a = 0;
      while (!result || a<100) {
        await uhg.delay(100)
        a++
      }
      if (user && message.startsWith('**NetWorth')) {
        user[cute_name] = {message: message, cute_name: cute_name, result: result}
        cache.set(api.username, user)
      } else {
        user = {}
        user[cute_name] = {message: message, cute_name: cute_name, result: result}
        cache.set(api.username, user)
      }
      return message || "Error v nw commandu (v2)"
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v NetWorth příkazu!"
    }
  }
}

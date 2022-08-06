const refresh = require('../../utils/serverroles.js')

module.exports = {
  name: "unverify",
  aliases: [],
  allowedids: [],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      let auth = ["312861502073995265", "427198829935460353", "379640544143343618", "378928808989949964"]
      if (!uhg.data.verify) uhg.data.verify = await uhg.mongo.run.get("general", "verify")
      let args = content.split(" ").filter(n => n)
      let id = message.author.id;
      let user = uhg.dc.client.users.cache.get(id);
      let custom = false;

      if (args.length && auth.includes(id)) {
        let unver = uhg.data.verify.filter(n => n.nickname.toLowerCase() == args[0].toLowerCase() || n.uuid.toLowerCase() == args[0].toLowerCase() || n._id == args[0])
        if (!unver.length && !message.mentions.users.first()) return `\`${args[0]}\` není verifikovaný`
        user = message.mentions.users.first() || uhg.dc.client.users.cache.get(unver[0]._id)
        id = user.id 
        custom = true
      }

      await refresh.unverify(uhg, user)

      let unverify = await uhg.mongo.run.delete("general", "verify", {_id:id})

      if (unverify.deletedCount && custom == false) message.channel.send(`Už nejsi verifikovaný!`)
      else if (unverify.deletedCount && custom == true) message.channel.send(`${user} již není verifikovaný`)
      else if (unverify.deletedCount==0 &&  custom == false) return `Nejsi verifikovaný!`
      else if (unverify.deletedCount==0 && custom == true) return `${user} není verifikovaný`
      else return "Někde nastala chyba!"


    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v unverify příkazu!"
    }
  }
}


const func = require('../util/ApiFunctions');

class Guild {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "guild", reason: 'Guild API needs player UUID or guild NAME to be called!'};
    const uuid = options.uuid;

    const apikey = client.getKey()
    if (!apikey) return  {success: false, type: "guild", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "guild", reason: 'Hypixel API key limit reached!'};

    let guild;
    try { guild = await client.callHypixel.get('guild', {params: { key: apikey, player: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "guild", reason: e.response ? e.response.data.cause : 'Guild API error'}};
    if (!guild.success) return  {success: false, type: "guild", reason: guild.cause};
    if (!guild.guild) return { success: true, type: 'guild', name: 'Žádná', guild: false }
    guild = guild.guild

    const api = { success: true, type: 'guild', guild: guild, name: guild.name, tag: guild.tag, color: func.getPlusColor(null, guild.tagColor).hex, members: guild.members }

    if (uuid && guild.members.find(n => n.uuid == uuid)) {
      let gmember = guild.members.find(n => n.uuid == uuid)
      gmember.dailygexp = Object.values(gmember.expHistory)[0] || 0
      gmember.weeklygexp = Object.values(gmember.expHistory).reduce((a, b) => a+b, 0)
      api.member = gmember
    }

    return api
  }
}

module.exports = Guild;

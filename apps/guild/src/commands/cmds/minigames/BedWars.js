const { ActionRowBuilder, ButtonBuilder  } = require("discord.js");

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
    name: eventName.toLowerCase(),
    aliases: ['bw'],
    permissions: [{ type: 'PREMIUM', permission: true }],
    platform: "mc",
    type: "message",
    run: async (uhg, data) => {
        console.log(data)
        let api = await uhg.api.call(data.nickname, ['hypixel'], { premium: true })
        if (!api.success) return api.reason
        let bedwars = api.hypixel.stats.bedwars
        let overall = bedwars.overall

        let msg = `**BedWars**: ${bedwars.levelformatted} **${api.username}** - ${f(overall.finalKills)}Finals ${f(overall.wins)}Wins ${f(overall.fkdr)}FKDR ${f(overall.wlr)}WLR (Main gamemode - ${bedwars.main_mode})`
return msg
    }
}

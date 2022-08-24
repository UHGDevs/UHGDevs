

exports.setup = (uhg, guild) => {
    let info = {
        name: 'SkyWars',
        path: 'hypixel/stats/skywars/',
        stats: ['level', 'overall/kdr', 'overall/wins', 'overall/kills'],
        statsNames: ['Level', 'KDR', 'Výhry', 'Zabití'],
        req: [[12, 18, 24], [1.5, 2, 3], [750, 3000, 8000], [1500, 15000, 35000]]
    }
    let find = new RegExp(`(${info.name}) (god|expert|trained)`, 'i')

    info.roles = guild.roles.cache.filter(n => n.name.match(find)).map(role => {

        role.pos = role.name.endsWith('God') ? 2 : (role.name.endsWith('Expert') ? 1 : 0 )
        role.req = info.req.map(n => n[role.pos])

        return role
    }).sort((a, b) => a.pos - b.pos)

    info.ids = info.roles.map(n => n.id)

    info.getRole = uhg.getBadgeRoles
    return info
}

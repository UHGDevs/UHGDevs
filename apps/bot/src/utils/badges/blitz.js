

exports.setup = (uhg, guild) => {
    let info = {
        name: 'Blitz SG',
        path: 'hypixel/stats/blitz/',
        stats: ['wins', 'kdr',  'kills'],
        statsNames: ['Výhry', 'KDR', 'Zabití'],
        req: [[100, 500, 1000], [0.5, 0.75, 1], [1250, 6000, 15000]]
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

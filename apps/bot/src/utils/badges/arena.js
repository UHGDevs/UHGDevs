

exports.setup = (uhg, guild) => {
    let info = {
        name: 'Arena Brawl',
        path: 'hypixel/stats/arena/overall/',
        stats: ['wins', 'kills'],
        statsNames: ['Výhry', 'Zabití'],
        req: [[500, 1500, 3000], [400, 1250, 2500]]
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

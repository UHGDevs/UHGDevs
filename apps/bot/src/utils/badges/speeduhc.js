

exports.setup = (uhg, guild) => {
    let info = {
        name: 'Speed UHC',
        path: 'hypixel/stats/speeduhc/',
        stats: ['wins', 'kills'],
        statsNames: ['Výhry', 'Zabití'],
        req: [[100, 250, 500], [250, 1000, 2500]]
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

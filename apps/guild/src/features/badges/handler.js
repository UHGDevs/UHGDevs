
const path = require('node:path');
const fs = require('fs');

class Badges {
    constructor() {

        this.setup()
        
    }

    setup() {     
        this.json = JSON.parse(fs.readFileSync(path.join(__dirname, './badges.json'), 'utf8'));

        let guild = dc_client.guilds.cache.get('455751845319802880')

        this.badges = this.json.map(info => {
            if (!guild) return info
            let role_reg = new RegExp(`(${info.name}) (god|expert|trained)`, 'i')
            info.roles = guild.roles.cache.filter(n => n.name.match(role_reg)).map(role => {
                role.pos = role.name.endsWith('God') ? 2 : (role.name.endsWith('Expert') ? 1 : 0 )
                role.req = info.req.map(n => n[role.pos])
                return role
            }).sort((a, b) => a.pos - b.pos)

            info.ids = info.roles.map(n => n.id)
            return info
        })
        this.splits = [].concat(...this.badges.map(n => n.ids || []));  
    }

    get(name) {
        return this.badges.find(n => n.name == name)
    }

    getBadgeRoles = (name, api) => {
        let info = this.badges.find(n => n.name == name)
        if (!info) return {}
        let stats = info.stats.map(n => apiPath(info.path + n, api))
        stats = stats.map((n, i) => {
            if (n < info.req[i][0]) return -1
            else if (n < info.req[i][1]) return 0
            else if (n < info.req[i][2]) return 1
            else return 2
        })
        let role_i = Math.min(...stats)
        let stat_role = role_i >= 0 ? info.roles[role_i] : null
        return {name: info.name, role: stat_role || 'Žádná role', delete: stat_role ? info.roles.filter(n => n.id !== stat_role.id) : info.roles }
      }

}

module.exports = {class: new Badges(), name: 'badges'}
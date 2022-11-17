
const path = require('node:path');
const fs = require('fs');

class Leaderboard {
    constructor() {

        this.data = []
        
        this.reload()
        
    }

    async reload() {


        let rawData = await uhg.get('general', 'lb', {})
        this.data = rawData

        return this.data
    }

    get(game) {
        return this.data.find(n => n.game.toLowerCase() == game?.toLowerCase())
    }

    async postLb(data) {
        if (!data._id) data._id = data.game.toLowerCase()
        data.gamemode = data.gamemode?.toLowerCase().split(',').map(n => n?.trim()).filter(n => n)
        data.stats = data.stats?.toLowerCase().split(',').map(n => n?.trim()).filter(n => n)
        data.ignore = data.ignore?.toLowerCase().split(',').map(n => n?.trim()).filter(n => n)
        await uhg.post('general', 'lb', data)

    }

    async deleteLb(game) {
        await uhg.delete('general', 'lb', { _id: game?.toLowerCase() })
    }



}

module.exports = {class: new Leaderboard(), name: 'lb'}
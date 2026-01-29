const axios = require('axios');
const ApiFunctions = require('../ApiFunctions');
const path = require('path');
const fs = require('fs');

module.exports = {
    /**
     * Hlavní statistiky (BW, SW, Arcade...)
     */
    getStats: async (uhg, uuid, key) => {
        const res = await axios.get(`https://api.hypixel.net/player`, { params: { key, uuid } });
        if (!res.data.success || !res.data.player) throw new Error("Hráč nebyl nalezen v Hypixel DB");

        const p = res.data.player;
        const api = {};
        api.stats = {
            updated: Date.now()
        }

        // 1. General (Root)
        const generalParser = require('../games/general');
        api.stats.general = await generalParser(p, uuid, uhg, p.displayname);
        

        // 2. Dynamické načtení ostatních her
        const gamesPath = path.resolve(__dirname, '../games');
        const files = fs.readdirSync(gamesPath).filter(f => f.endsWith('.js') && f !== 'general.js');

        for (const file of files) {
            try {
                const gameName = file.split('.')[0];
                const parser = require(path.join(gamesPath, file));
                api.stats[gameName] = await parser(p);
            } catch (e) {
                console.error(` [API] Parser error ${file}: ${e.message}`);
            }
        }

        return { 
            stats: api.stats, 
            achievements: p.achievements 
        };
    },

    /**
     * Guilda
     */
    getGuild: async (uhg, uuid, key) => {
        const res = await axios.get(`https://api.hypixel.net/guild`, { params: { key, player: uuid } });
        const g = res.data.guild;
        
        if (!g) return { guild: false, name: "Žádná" };

        return {
            guild: true,
            name: g.name,
            tag: g.tag,
            id: g._id,
            level: ApiFunctions.getGuildLevel(g.exp),
            membersCount: g.members.length,
            member: g.members.find(m => m.uuid === uuid),
            all: g // Pro případ, že bychom chtěli počítat GEXP
        };
    },

    /**
     * Online Status
     */
    getStatus: async (uhg, uuid, key) => {
        const res = await axios.get(`https://api.hypixel.net/status`, { params: { key, uuid } });
        return ApiFunctions.getOnline(res.data.session);
    }
};
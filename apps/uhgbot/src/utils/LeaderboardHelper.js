/**
 * src/utils/LeaderboardHelper.js
 */
const fs = require('fs');
const path = require('path');
const ApiFunctions = require('../api/ApiFunctions');

class LeaderboardHelper {
    constructor() {
        const mapPath = path.resolve(__dirname, '../api/constants/lb_map.json');
        this.map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};
    }

    getConfig(game, mode, statKey) {
        const gameData = this.map[game];
        if (!gameData) return null;

        const modeData = gameData.structure[mode];
        if (!modeData) return null;

        const statData = modeData.stats[statKey];
        if (!statData) return null;

        const modePath = modeData.path !== undefined ? modeData.path : mode;
        const rootPath = [gameData.root, modePath].filter(p => p && p.length > 0).join('.');

        let config = {};

        if (typeof statData === 'string') {
            config = { 
                name: statData, 
                dbPath: `${rootPath}.${statKey}`, 
                displayPath: `${rootPath}.${statKey}`,
                transform: null
            };
        } else {
            config = {
                name: statData.name,
                dbPath: `${rootPath}.${statData.db || statKey}`,
                displayPath: `${rootPath}.${statData.display || statData.db || statKey}`,
                transform: statData.transform || null
            };
        }
        
        if (config.dbPath.startsWith('.')) config.dbPath = config.dbPath.substring(1);
        if (config.displayPath.startsWith('.')) config.displayPath = config.displayPath.substring(1);

        return config;
    }

    getProjection(config) {
        if (!config) return null;
        return {
            username: 1,
            uuid: 1,
            [config.dbPath]: 1,
            [config.displayPath]: 1
        };
    }

    getValue(playerObj, path, transformName) {
        let val = path.split('.').reduce((o, k) => (o || {})[k], playerObj);
        
        if (transformName === 'nwLevel') return Math.floor(ApiFunctions.getNwLevel(val || 0));
        if (transformName === 'timeHours') return (val ? Math.floor(val / 60) + 'h' : '0h');
        if (transformName === 'timeSeconds') return (val ? (val / 1000).toFixed(2) + 's' : 'N/A');
        
        return val;
    }

    // --- OPRAVENÉ AUTOCOMPLETE METODY ---

    getGames(search) {
        const allGames = Object.keys(this.map).map(k => ({ name: this.map[k].name, value: k }));
        
        if (!search) return allGames.slice(0, 25);

        return allGames
            .filter(g => g.name.toLowerCase().includes(search) || g.value.toLowerCase().includes(search))
            .slice(0, 25);
    }

    getModes(game, search) {
        if (!this.map[game]) return [];

        const allModes = Object.entries(this.map[game].structure).map(([key, data]) => ({
            name: data.name,
            value: key
        }));

        // Pokud uživatel nic nepíše, vrátíme prvních 25 možností
        if (!search) return allModes.slice(0, 25);

        return allModes
            .filter(m => m.name.toLowerCase().includes(search) || m.value.toLowerCase().includes(search))
            .slice(0, 25);
    }

    getStats(game, mode, search) {
        if (!this.map[game] || !this.map[game].structure[mode]) return [];
        
        const statsObj = this.map[game].structure[mode].stats;
        const allStats = Object.entries(statsObj).map(([key, val]) => {
            const name = typeof val === 'string' ? val : val.name;
            return { name: name, value: key };
        });

        // Pokud uživatel nic nepíše, vrátíme prvních 25 možností
        if (!search) return allStats.slice(0, 25);

        return allStats
            .filter(s => s.name.toLowerCase().includes(search) || s.value.toLowerCase().includes(search))
            .slice(0, 25);
    }
    
    getStatName(game, mode, stat) {
        const val = this.map[game]?.structure[mode]?.stats[stat];
        return typeof val === 'string' ? val : (val?.name || stat);
    }

    getGameName(game) { return this.map[game]?.name || game; }
    
    getModeName(game, mode) { return this.map[game]?.structure[mode]?.name || mode; }
}

module.exports = LeaderboardHelper;
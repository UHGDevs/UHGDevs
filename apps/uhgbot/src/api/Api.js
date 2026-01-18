/**
 * src/utils/Api.js
 */
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const ApiFunctions = require('./ApiFunctions');

class Api {
    constructor(uhg) {
        this.uhg = uhg;
        this.key = process.env.api_key;
        this.apiCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
        
        this.parsers = new Map();
        this._loadParsers();
    }

    _loadParsers() {
        const gamesPath = path.resolve(__dirname, './games');
        if (fs.existsSync(gamesPath)) {
            const files = fs.readdirSync(gamesPath).filter(f => f.endsWith('.js'));
            for (const file of files) {
                try {
                    const gameName = file.split('.')[0];
                    this.parsers.set(gameName, require(path.join(gamesPath, file)));
                } catch (e) {
                    console.error(` [ERROR] ${file} Parser: ${e.message}`.red);
                }
            }
        }
    }

    async call(input, calls = ["hypixel"]) {
        if (!input) return { success: false, reason: "Nebyl zadán vstup" };

        const cacheKey = `call_${input.toLowerCase()}_${calls.sort().join(',')}`;
        const cachedResult = this.apiCache.get(cacheKey);
        if (cachedResult) return cachedResult;

        const identity = await this.getMojang(input);
        if (!identity.success) return { success: false, reason: "Hráč nenalezen v Mojang databázi." };

        let result = { 
            success: true, 
            uuid: identity.uuid, 
            username: identity.username,
            date: identity.date,
            textures: identity.textures
        };

        const promises = [];
        if (calls.includes("hypixel")) promises.push(this.getHypixel(identity.uuid));
        if (calls.includes("guild")) promises.push(this.getGuild(identity.uuid));
        if (calls.includes("online")) promises.push(this.getOnline(identity.uuid));
        if (calls.includes("skyblock") || calls.includes("sb")) promises.push(this.getSkyblock(identity.uuid));

        const apiResults = await Promise.all(promises);

        let criticalError = null;
        apiResults.forEach(res => {
            if (res._error) {
                criticalError = res._error;
            } else {
                Object.assign(result, res);
            }
        });

        if (calls.includes("hypixel") && !result.hypixel) {
            return { success: false, reason: "Hypixel API nevrátilo data (možná chyba parseru)." };
        }

        if (criticalError) {
            return { success: false, reason: criticalError };
        }

        // --- INTELIGENTNÍ AUTO-SAVE ---
        if (result.hypixel && this.uhg.db) {
            // Spustíme asynchronně na pozadí, nečekáme na výsledek (nebrzdíme příkaz)
            this._saveIfTracked(result.uuid, result.hypixel);
        }

        this.apiCache.set(cacheKey, result);
        return result;
    }

    /**
     * Interní funkce: Uloží statistiky jen pokud uživatel už v DB existuje.
     */
    async _saveIfTracked(uuid, stats) {
        try {
            const db = this.uhg.db.mongo.db("stats");
            const col = db.collection("stats");
            
            // Podíváme se, jestli už hráče sledujeme (CZ/SK filtr)
            const exists = await col.findOne({ uuid: uuid }, { projection: { _id: 1 } });
            
            if (exists) {
                // Hráč v DB je -> aktualizujeme mu stats čerstvými daty
                await this.uhg.db.saveStats(uuid, stats);
                // console.log(`[API] Automatický update: ${stats.username}`.gray);
            }
        } catch (e) {
            // Tichá chyba, aby DB check neovlivnil chod bota
        }
    }

    async getMojang(input) {

        const cacheKey = `mojang_${input.toLowerCase()}`;
        const cached = this.apiCache.get(cacheKey);
        if (cached) return cached;
    
        try {
            const res = await axios.get(`https://api.ashcon.app/mojang/v2/user/${input}`);
            const data = { 
                success: true, 
                uuid: res.data.uuid.replace(/-/g, ""), 
                username: res.data.username,
                date: new Date(res.data.created_at),
                textures: res.data.textures
            };

            this.apiCache.set(cacheKey, data, 3600);
            return data;
        } catch (e) { return { success: false, reason: "Nevím, mojang" }; }
    }

async getHypixel(uuid) {
    try {
        const res = await axios.get(`https://api.hypixel.net/player`, { 
            params: { key: this.key, uuid } 
        });

        if (!res.data.success) return { _error: `Hypixel API: ${res.data.cause}` };
        if (!res.data.player) return { _error: "Hráč nikdy nehrál na Hypixelu" };

        const p = res.data.player;

        // 1. ZÍSKÁNÍ ZÁKLADNÍHO OBJEKTU PŘES GENERAL.JS
        // Ve starém botovi general.js vytvářel root celého API objektu.
        const generalParser = this.parsers.get('general');
        let playerStats = {};

        if (generalParser) {
            // Voláme general parser (předáváme hypixel_data, uuid, uhg_instance, displayname)
            playerStats = await generalParser(p, uuid, this.uhg, p.displayname);
        } else {
            // Fallback pokud by general.js chyběl (aby bot nespadl)
            playerStats = {
                success: true,
                type: 'hypixel',
                _id: uuid,
                uuid: uuid,
                username: p.displayname,
                level: ApiFunctions.getNwLevel(p.networkExp || 0),
                aps: p.achievementPoints || 0
            };
        }

        // 2. PŘIDÁNÍ STATS OBJEKTU PRO OSTATNÍ HRY
        // Starý bot dělal: api.stats = {}
        playerStats.stats = {};

        // 3. CYKLUS PŘES VŠECHNY OSTATNÍ PARSERY (Kromě general.js)
        for (const [game, parseFunc] of this.parsers) {
            if (game === 'general') continue;
            try {
                // Některé hry mohou vyžadovat await, pokud jsi je tak v minulosti napsal
                const result = await parseFunc(p); 
                playerStats.stats[game] = result;
            } catch (e) {
                console.error(` [API Error] Parser ${game} selhal:`.red, e.message);
            }
        }

        // Zajistíme, aby root obsahoval 'aps' pro AP command
        // (původní general.js to dělal přes: aps: hypixel.achievementPoints || 0)
        if (!playerStats.aps && p.achievementPoints) {
            playerStats.aps = p.achievementPoints;
        }

        return { hypixel: playerStats };

    } catch (e) {
        const status = e.response?.status;
        const cause = e.response?.data?.cause || e.message;
        
        // Logování jen pro vážné chyby (ne 404 hráč nenalezen)
        if (status !== 404) {
            console.error(` [API ERROR] Hypixel ${status}: ${cause}`.red);
        }
        
        // Vrátíme objekt s chybou
        let errorMsg = `Hypixel API Error: ${e.message}`;
        if (status === 429) errorMsg = "Hypixel API Rate Limit (Too Many Requests). Zkus to za chvíli.";
        if (status === 503) errorMsg = "Hypixel API je momentálně nedostupné (Maintenance).";
        if (status === 403) errorMsg = "Neplatný API klíč.";

        return { _error: errorMsg };
    }
}

    async getGuild(uuid) {
        try {
            const res = await axios.get(`https://api.hypixel.net/guild`, { params: { key: this.key, player: uuid } });
            const g = res.data.guild;
            if (!g) return { guild: { guild: false, name: "Žádná" } };
            return { guild: { guild: true, name: g.name, tag: g.tag, member: g.members.find(m => m.uuid === uuid), all: g }};
        } catch (e) { return { _error: `Guild API: ${e.message}` } }
    }

    async getOnline(uuid) {
        try {
            const res = await axios.get(`https://api.hypixel.net/status`, { params: { key: this.key, uuid } });
            return { online: ApiFunctions.getOnline(res.data.session) };
        } catch (e) { return { _error: `Status API: ${e.message}` } }
    }
    /**
     * Komplexní parsování SkyBlocku (včetně profilů a Networthu)
     */
    async getSkyblock(uuid) {
        try {
            const res = await axios.get(`https://api.hypixel.net/v2/skyblock/profiles`, { params: { key: this.key, uuid } });
            if (!res.data.success || !res.data.profiles) return { skyblock: { profiles: [] } };

            const rawProfiles = res.data.profiles;
            const profiles = [];

            for (const p of rawProfiles) {
                const memberData = p.members[uuid];
                if (!memberData) continue;

                // Základní formátování profilu (z tvého původního src/api/skyblock.js)
                let profile = {
                    id: p.profile_id,
                    name: p.cute_name,
                    mode: p.game_mode || "normal",
                    selected: p.selected || false,
                    last_save: p.last_save,
                    bank: p.banking ? Math.floor(p.banking.balance) : -1,
                    // Sem můžeš přidat další parsování (upgrades, community atd.)
                };

                // Zpracování člena profilu (tady by se dalo volat tvé player.js)
                const playerParserPath = path.resolve(__dirname, './skyblock/player.js');
                if (fs.existsSync(playerParserPath)) {
                    const playerParser = require(playerParserPath);
                    profile.member = playerParser(memberData, p, { cache: { hypixel_achievements: {} } });
                } else {
                    profile.member = memberData; // Raw data jako fallback
                }

                profiles.push(profile);
            }

            // Seřazení: vybraný profil první, pak podle data uložení
            profiles.sort((a, b) => (b.selected - a.selected) || (b.last_save - a.last_save));

            return { skyblock: { profiles } };
        } catch (e) {
            console.error(` [ERROR] SkyBlock API: ${e.message}`.red);
            return { _error: `SkyBlock API: ${e.message}` };
        }
    }
}

module.exports = Api;
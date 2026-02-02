/**
 * src/api/Api.js
 * Hlavní rozcestník.
 */
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const { getPrices } = require('skyhelper-networth');

// Import jednotlivých volání
const CallMojang = require('./calls/Mojang');
const CallHypixel = require('./calls/Hypixel');
const CallSkyBlock = require('./calls/SkyBlock');

class Api {
    constructor(uhg) {
        this.uhg = uhg;
        this.key = process.env.api_key;
        
        // Cache: 10 minut std, check každou minutu
        this.cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

        this.prices = {};
        this.startPriceUpdater()
        
    }

/**
     * Hlavní metoda volání
     * @param {string} input - Jméno nebo UUID
     * @param {string[]} types - ["hypixel", "skyblock", "guild", "online"]
     * @param {object{}} options - např. Zda čekat na zápis do DB
     */
    async call(input, types = ["hypixel"], options = {}) {
        if (!input) return { success: false, reason: "Nebyl zadán vstup" };

        let waitSave = options.waitSave || false;
        try {
            // 1. Získání Identity (Mojang) - Cache je uvnitř CallMojang
            const identity = await CallMojang(input, this.cache);
            if (!identity.success) throw new Error(identity.reason);

            const { uuid, username } = identity;
            const result = { success: true, uuid, username, ...identity };

            // 2. Kontrola Cache pro jednotlivé moduly
            const promises = [];
            const fetchTypes = [];

            for (const type of types) {
                const cacheKey = `${type}_${uuid}`;
                let cachedData = this.cache.get(cacheKey);

                if (cachedData && options.cachePath) {
                    if (options.cachePath.startsWith(type)) {
                        const tempObj = { [type]: cachedData };
                        const valueToCheck = this._resolvePath(tempObj, options.cachePath);

                        if (valueToCheck === undefined) {
                            this.cache.del(cacheKey);
                            cachedData = null;
                        }
                    }
                }

                if (cachedData) {
                    result[type] = cachedData;
                } else {
                    fetchTypes.push(type);
                }
            }

            // Pokud máme vše v cachi, rovnou uložíme (pokud je třeba) a vrátíme
            if (fetchTypes.length === 0) {
                if (waitSave) await this._smartSave(result);
                else this._smartSave(result);
                return result;
            }

            let hypixelPromise = null;

            // 3. Sestavení požadavků pro chybějící data
            if (fetchTypes.includes("hypixel") || fetchTypes.includes("stats")) {
                hypixelPromise = CallHypixel.getStats(this.uhg, uuid, this.key);
                promises.push(hypixelPromise.then(res => ({ hypixel: res })));
            }

            if (fetchTypes.includes("guild")) {
                promises.push(CallHypixel.getGuild(this.uhg, uuid, this.key).then(guild => ({ guild })));
            }

            if (fetchTypes.includes("online")) {
                promises.push(CallHypixel.getStatus(this.uhg, uuid, this.key).then(online => ({ online })));
            }

            if (fetchTypes.includes("skyblock") || fetchTypes.includes("sb")) {
                const runSb = async () => {
                    let achs = null;

                    // A) Pokud se Hypixel stahuje v TOMTO callu, počkáme na něj
                    if (hypixelPromise) {
                        try {
                            const hpData = await hypixelPromise;
                            achs = hpData.achievements;
                        } catch (e) { /* Hypixel selhal, achs zůstane null */ }
                    } 
                    
                    // B) Pokud se Hypixel v tomto callu nestahuje, zkusíme ho vytáhnout z cache
                    if (!achs) {
                        achs = this.cache.get(`hypixel_${uuid}`)?.achievements;
                    }

                    const sbData = await CallSkyBlock.getProfiles(this.uhg, uuid, this.key, {...options, achievements: achs});
                    return { skyblock: sbData };
                };
                promises.push(runSb());
            }

            // 4. Čekání na výsledky
            const responses = await Promise.all(promises);

            // 5. Sloučení dat a ULOŽENÍ DO CACHE
            responses.forEach(res => {
                Object.assign(result, res);
                
                // Automaticky uložíme každý nově stažený modul do jeho vlastní cache
                for (const [moduleName, data] of Object.entries(res)) {
                    this.cache.set(`${moduleName}_${uuid}`, data);
                }
            });

            // 6. SMART UPDATE (Uložíme do DB jen to, co je v 'result')
            if (waitSave) await this._smartSave(result);
            else this._smartSave(result);

            return result;

        } catch (e) {
            console.error(` [API ERROR] call: ${e.message}`.red);
            return { success: false, reason: e.message };
        }
    }
     /**
     * Helper pro získání identity hráče bez stahování herních statistik.
     * Používají ho příkazy jako /database, /verify, /badges.
     */
    async getMojang(input) {
        return await CallMojang(input, this.cache);
    }

    /**
     * SMART SAVE (Strict Mode)
     * Automaticky ukládá data do databáze 'data', kolekce 'users'.
     */
    async _smartSave(data) {
        if (!this.uhg.db || !data.uuid) return;
        const uuid = data.uuid;
        
        try {
            const userInDb = await this.uhg.db.getUser(uuid);
            if (!userInDb) return; // Neukládáme neznámé hráče

            const updatePayload = {
                username: data.username,
                updated: Date.now()
            };
            if (data.created_at) updatePayload.created_at = new Date(data.created_at);

            // Hypixel Stats - Ukládáme jen pokud má user povolené stats
            if (data.hypixel && data.hypixel.stats && userInDb.stats) {
                updatePayload.stats = data.hypixel.stats;
                updatePayload.stats.updated = Date.now();
            }

            // SkyBlock - Ukládáme jen pokud má user povolené sb
            if (data.skyblock && data.skyblock.profiles && userInDb.sb) {
                const selected = data.skyblock.profiles.find(p => p.selected) || data.skyblock.profiles[0];
                
                if (selected && selected.member) {
                    const m = selected.member;
                    updatePayload.sb = {
                        updated: Date.now(),
                    };
                }
            }

            if (userInDb.garden?.emptyAt && data.skyblock?.profiles.find(n => n.name == userInDb.garden.profileName)?.garden?.composter?.emptyAt) {
                if (data.skyblock?.profiles.find(n => n.name == userInDb.garden.profileName)?.garden?.composter?.emptyAt > Date.now()) updatePayload["garden.alert_sent"] = false;
                updatePayload["garden.emptyAt"] = data.skyblock?.profiles.find(n => n.name == userInDb.garden.profileName)?.garden?.composter?.emptyAt || undefined;
            }

            await this.uhg.db.saveUser(uuid, updatePayload);

            const TRACKED_GUILDS = ["UltimateHypixelGuild", "TKJK"/*, "Czech Team"*/];
            if (data.guild && data.guild.guild) {
                const g = data.guild;

                // KONTROLA: Ukládáme jen pokud je to jedna z našich guild!
                if (TRACKED_GUILDS.includes(g.name)) {
                    
                    const today = new Date().toISOString().slice(0, 10);
                    
                    // Metoda v Database.js, která updatuje konkrétní guildu v poli
                    // Pokud tam guilda není (např. se do ní zrovna připojil), založí ji.
                    // Ale protože userInDb check prošel, víme, že uživatel v DB je.
                    await this.uhg.db.updateUserGexp(
                        uuid, 
                        g.name, 
                        today, 
                        g.member.dailygexp || 0, 
                        g.member.rank
                    );
                }
            }

        } catch (e) {
            console.error(` [DB ERROR] Smart Save (${data.username}): ${e.message}`.red);
        }
    }

    async startPriceUpdater() {
        try {
            this.prices = await getPrices();
        } catch (e) {
            console.error(`[PRICES ERROR] Načítání cen: ${e.message}`.red);
        }
        setInterval(async () => {
            try {
                this.prices = await getPrices();
            } catch (e) {
                console.error(`[PRICES ERROR] Načítání Cen: ${e.message}`.red);
            }
        }, 1000 * 60 * 60); // 1 za hodinu 
    }

    /**
     * Pomocná metoda pro procházení objektu stringovou cestou
     * @param {Object} obj 
     * @param {String} path např. "skyblock/profiles[0]/garden/level"
     */
    _resolvePath(obj, path) {
        // Rozdělí cestu podle / . [ ] a odstraní prázdné znaky
        // "profiles[0]" -> ["profiles", "0"]
        const keys = path.replace(/\[/g, '.').replace(/\]/g, '').split(/[\/\.]/).filter(k => k);
        
        let current = obj;
        for (const key of keys) {
            if (current === undefined || current === null) return undefined;
            current = current[key];
        }
        return current;
    }
}

module.exports = Api;
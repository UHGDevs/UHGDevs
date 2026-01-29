/**
 * src/api/Api.js
 * Hlavní rozcestník.
 */
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

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
    }

    /**
     * Hlavní metoda volání
     * @param {string} input - Jméno nebo UUID
     * @param {string[]} types - ["hypixel", "skyblock", "guild", "online"]
     */
    async call(input, types = ["hypixel"], waitSave = false) {
        if (!input) return { success: false, reason: "Nebyl zadán vstup" };

        try {
            // 1. Získání Identity (Mojang)
            const identity = await CallMojang(input, this.cache);
            if (!identity.success) throw new Error(identity.reason);

            const { uuid, username } = identity;
            const result = { success: true, uuid, username, ...identity };

            // 2. Sestavení požadavků (Promises)
            const promises = [];

            // HYPIXEL STATS
            if (types.includes("hypixel") || types.includes("stats")) {
                promises.push(
                    CallHypixel.getStats(this.uhg, uuid, this.key)
                        .then(parsed => {
                            return { hypixel: parsed };
                        })
                );
            }

            // GUILD
            if (types.includes("guild")) {
                promises.push(
                    CallHypixel.getGuild(this.uhg, uuid, this.key)
                        .then(guild => ({ guild }))
                );
            }

            // ONLINE STATUS
            if (types.includes("online")) {
                promises.push(
                    CallHypixel.getStatus(this.uhg, uuid, this.key)
                        .then(online => ({ online }))
                );
            }

            // SKYBLOCK
            if (types.includes("skyblock") || types.includes("sb")) {
                // Zkusíme vytáhnout achievementy z cache (pokud tam už hypixel data jsou)
                const hypixelCache = this.cache.get(`hypixel_${uuid}`);
                const achievements = hypixelCache?.achievements || null;
                
                promises.push(
                    CallSkyBlock.getProfiles(this.uhg, uuid, this.key, achievements)
                        .then(skyblock => ({ skyblock }))
                );
            }

            // 3. Čekání na výsledky (FAIL-FAST)
            // Pokud jakýkoliv promise selže, skočíme ihned do catch bloku
            const responses = await Promise.all(promises);

            // 4. Sloučení dat
            responses.forEach(res => {
                Object.assign(result, res);
            });

            // 5. Uložení do Cache (Hypixel data)
            if (result.hypixel) {
                // Pokud už v cache něco je, mergneme to (abychom nepřepsali třeba guild data pokud teď taháme jen stats)
                const currentCache = this.cache.get(`hypixel_${uuid}`) || {};
                this.cache.set(`hypixel_${uuid}`, { ...currentCache, ...result.hypixel });
            }
            
            // 6. SMART UPDATE (Uložení do DB)
            if (waitSave) {
                // Počkáme (např. u /database add, aby se hned ukázala data)
                await this._smartSave(result);
            } else {
                // Nepočkáme (u běžných příkazů jako !bw), uložení proběhne na pozadí
                this._smartSave(result);
            }
            return result;

        } catch (e) {
            // Zde zachytíme jak chybu z Mojangu, tak jakoukoliv chybu z Promise.all
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
                        profile_id: selected.id,
                        profile_name: selected.name,
                        mode: selected.mode,
                        coins: m.coins,
                        skills: m.skills,
                        skill_average: m.skill_average,
                        dungeons: m.dungeons,
                        slayers: m.slayers,
                        mining: m.mining
                    };
                }
            }

            await this.uhg.db.saveUser(uuid, updatePayload);

            const TRACKED_GUILDS = ["UltimateHypixelGuild", "TKJK", "Czech Team"];
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
}

module.exports = Api;
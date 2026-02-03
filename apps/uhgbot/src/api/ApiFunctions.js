/**
 * src/api/ApiFunctions.js
 * Kompletní sada funkcí pro výpočty všech her a SkyBlocku na Hypixelu.
 */

const sbConstants = require('./constants/skyblock');

class ApiFunctions {
    // --- ZÁKLADNÍ FORMÁTOVÁNÍ ---
    /**
     * Formátování čísel
     * @param {number} number - Číslo k formátování
     * @param {number} max - Počet desetinných míst
     * @param {boolean} asNumber - Pokud true, vrátí Number (zaokrouhlené). Pokud false, vrátí String (formátovaný).
     */
    static f(number, max = 2, asNumber = false) {
        // Ošetření neplatných vstupů
        if (number === undefined || number === null || isNaN(number)) {
            return asNumber ? 0 : "0";
        }

        // Pokud chceme vrátit číslo (pro API/DB)
        if (asNumber) {
            // parseFloat(toFixed) zajistí správné zaokrouhlení a odstranění zbytečných nul
            return parseFloat(Number(number).toFixed(max));
        }

        // Pokud chceme vrátit string (pro Discord výpis)
        return Number(number).toLocaleString('cs-CZ', {
            minimumFractionDigits: 0,
            maximumFractionDigits: max
        }).replace(/\u00A0/g, ' '); 
    }

    static ratio(n1 = 0, n2 = 0, n3 = 2) {
        const res = isFinite(n1 / n2) ? (n1 / n2) : n1;
        return Number(res.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: n3 }));
    }

    static romanize(num) {
        if (num === 0) return "0";
        const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = '', i;
        for (i in lookup) { while (num >= lookup[i]) { roman += i; num -= lookup[i]; } }
        return roman;
    }

    /** Odstranění barev (§) a řídících znaků z MC zpráv */
    static clear(msg) { 
        if (!msg) return "";
        return msg
            .replace(/§[0-9a-fk-or]/gi, '')
            .replace(/✫|✪|⚝/g, '?')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .trim(); 
    }

    // --- NETWORK & RANKS ---
    static getNwLevel(exp) { return Math.sqrt(Number(exp) * 2 + 30625) / 50 - 2.5; }

    static getRank(json) {
        const replaceRank = (rank) => rank.replace(/§.|\[|]/g, '').replace('SUPERSTAR', "MVP++").replace('VIP_PLUS', 'VIP+').replace('MVP_PLUS', 'MVP+').replace('NONE', 'MVP+').replace("GAME_MASTER", "GM").replace("YOUTUBER", "YOUTUBE");
        let rank = json.prefix || json.rank || json.monthlyPackageRank || json.packageRank || json.newPackageRank || false;
        if (!rank || rank === "NORMAL") return { rank: "NON", prefix: json.displayname };
        const cleanRank = replaceRank(rank);
        return { rank: cleanRank, prefix: `[${cleanRank}] ${json.displayname}` };
    }

    static getPlusColor(rank, plus) {
        // Fallback hodnoty
        const defaultColor = { mc: '§7', hex: '#BAB6B6' };

        if (!plus || rank === 'PIG+++' || rank === "OWNER" || rank === "ADMIN" || rank === "GM") {
            const rankColor = {
                'MVP': { mc: '§b', hex: '#55FFFF' },
                'MVP+': { mc: '§c', hex: '#FF5555' },
                'MVP++': { mc: '§c', hex: '#FFAA00' },
                'VIP+': { mc: '§a', hex: '#55FF55' },
                'VIP': { mc: '§a', hex: '#55FF55' },
                'PIG+++': { mc: '§d', hex: '#FF55FF' },
                'OWNER': { mc: '§c', hex: '#FF5555' },
                'ADMIN': { mc: '§c', hex: '#FF5555' },
                'GM': { mc: '§2', hex: '#00AA00' },
                'YOUTUBE': { mc: '§c', hex: '#FF5555' } // Youtube většinou červená
            }[rank];
            return rankColor || defaultColor;
        } else {
            const rankColorMC = {
                RED: { mc: '§c', hex: '#FF5555' },
                GOLD: { mc: '§6', hex: '#FFAA00' },
                GREEN: { mc: '§a', hex: '#55FF55' },
                YELLOW: { mc: '§e', hex: '#FFFF55' },
                LIGHT_PURPLE: { mc: '§d', hex: '#FF55FF' },
                WHITE: { mc: '§f', hex: '#F2F2F2' },
                BLUE: { mc: '§9', hex: '#5555FF' },
                DARK_GREEN: { mc: '§2', hex: '#00AA00' },
                DARK_RED: { mc: '§4', hex: '#AA0000' },
                DARK_AQUA: { mc: '§3', hex: '#00AAAA' },
                DARK_PURPLE: { mc: '§5', hex: '#AA00AA' },
                DARK_GRAY: { mc: '§8', hex: '#555555' },
                BLACK: { mc: '§0', hex: '#000000' },
                DARK_BLUE: { mc: '§1', hex: '#0000AA'}
            }[plus];
            return rankColorMC || defaultColor;
        }
    }

    // --- BEDWARS LEVELING ---
    static getBwExpForLevel(level) {
        var progress = level % 100;
        if (progress > 3) return 5000;
        return { 0: 500, 1: 1000, 2: 2000, 3: 3500 }[progress];
    }

    static getBwLevel(exp = 0) {
        var prestiges = Math.floor(exp / 487000);
        var level = prestiges * 100;
        var remainingExp = exp - (prestiges * 487000);
        for (let i = 0; i < 4; ++i) {
            var expForNextLevel = this.getBwExpForLevel(i);
            if (remainingExp < expForNextLevel) break;
            level++;
            remainingExp -= expForNextLevel;
        }
        return parseFloat((level + (remainingExp / 5000)).toFixed(2));
    }

    // --- SKYWARS LEVELING ---
    static getSwLevel(xp) {
        var xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];
        if (xp >= 15000) return (xp - 15000) / 10000 + 12;
        for (let i = 0; i < xps.length; i++) {
            if (xp < xps[i]) return i + (xp - xps[i-1]) / (xps[i] - xps[i-1]);
        }
        return 0;
    }

    static getSwExpLeft(xp) {
        var xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];
        if (xp >= 15000) return 10000 - ((xp - 15000) % 10000);
        for (let i=0; i < xps.length; i++) { if (xp < xps[i]) return (xps[i] - xp); }
        return 0;
    }

    // --- WOOL WARS LEVELING ---
    static getWwLevel(exp = 0) {
        let level = 0; let hundred = Math.floor(exp / 485000);
        if (exp - 485000 * hundred < 10000) {
            let o = 0; let finalexp = 0; let levels = {0: 1000, 1: 2000, 2: 3000, 3: 4000};
            for (let i = 0; i < 4; i++) {
                if (exp - 485000 * hundred > 0) {
                    exp = exp - 485000 * hundred - levels[i];
                    level++; o = levels[i]; finalexp = exp + levels[i];
                } else break;
            }
            level += hundred * 100 + finalexp / o;
        } else {
            let x = ((exp - 485000 * hundred) - 10000) / 5000 + 5;
            level = hundred * 100 + x;
        }
        return { level, levelformatted: Math.floor(level) };
    }

    // --- TITULY A DALŠÍ HRY ---
    static getCaC(score) {
        if (score >= 100000) return 'Red';
        if (score >= 50000) return 'Dark Aqua';
        if (score >= 20000) return 'Gold';
        if (score >= 5000) return 'Yellow';
        return score >= 2500 ? 'White' : 'Gray';
    }

    static getBuildBattle(score) {
        if (score >= 20000) return 'Master';
        if (score >= 15000) return 'Expert';
        if (score >= 10000) return 'Professional';
        if (score >= 7500) return 'Talented';
        if (score >= 5000) return 'Skilled';
        if (score >= 3500) return 'Trained';
        if (score >= 2000) return 'Seasoned';
        return score >= 1500 ? 'Experienced' : 'Rookie';
    }

    static getUHC(score) {
        let stars = 1;
        let table = [10, 60, 210, 460, 960, 1710, 2710, 5210, 10210, 13210, 16210, 19210, 22210, 25210];
        for (let s of table) { if (score >= s) stars++; }
        return stars;
    }

    static getSpeedUHC(score) {
        let stars = 1;
        let table = [50, 300, 1050, 2560, 5550, 15550, 30550, 55550, 85550];
        for (let s of table) { if (score >= s) stars++; }
        return stars;
    }

    static getSpeedUHCPerk(perk) {
        if (!perk || perk == "None") return "None";
        return perk.split("_").slice(1).map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    }

    static getGamemode(mode) {
        if (!mode) return "";
        return mode.toLowerCase().replace(/_/g, " ")
            .replace(/eight one/g, "Solo").replace(/eight two/g, "Doubles")
            .replace(/four three/g, "3v3v3v3").replace(/four four/g, "4v4v4v4")
            .replace(/two four/g, "4v4").trim();
    }

    static getEvents(api) {
        let obj = {};
        for (let event in api) {
            if (!["christmas", "summer", "easter", "halloween"].includes(event)) continue;
            let cap = event == "summer" ? 25000 : 10000;
            let objevent = {};
            for (let year in api[event]) {
                if (!api[event]?.[year]?.levelling) continue;
                let exp = api[event]?.[year]?.levelling?.experience || 0;
                objevent[year] = { experience: exp, level: 1 + exp / cap, xpleft: cap - (exp % cap) };
            }
            obj[event] = objevent;
        }
        return obj;
    }

    static getOnline(json) {
        if (!json || !json.online) return { online: false, title: "Offline" };
        return { online: true, title: "Online", game: json.gameType, mode: json.mode };
    }

    /**
     * Převod sekund na komplexní časový objekt
     * @param {number} sec - sekundy
     * @param {boolean} ms - true, pokud je vstup v milisekundách
     */
    static toTime(sec, ms = false) {
        if (ms) sec = sec / 1000;
        let days = sec / 60 / 60 / 24;
        let hours = (sec / 60 / 60) % 24;
        let minutes = sec / 60;
        let seconds = sec % 60;

        let formatted = `${Math.floor(Number(days))}d ${Math.floor(Number(hours))}h`;
        let miniformatted = `${Math.floor(Number(minutes))}min ${Math.floor(Number(seconds))}s`;

        return {
            formatted: formatted,           // "5d 12h"
            miniformatted: miniformatted,   // "30min 15s"
            h: sec / 60 / 60,               // celkem hodin (desetinné)
            d: sec / 60 / 60 / 24,          // celkem dnů (desetinné)
            m: sec / 60,                    // celkem minut (desetinné)
            s: sec                          // celkem sekund
        };
    }

    static getGuildLevel(exp) {
        const EXP_NEEDED = [
            100000, 150000, 250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 
            2500000, 2500000, 2500000, 2500000, 2500000, 3000000
        ];

        let level = 0;
        let currentExp = exp;

        for (let i = 0; i <= 1000; i++) {
            let need = 0;
            if (i >= EXP_NEEDED.length) {
                need = EXP_NEEDED[EXP_NEEDED.length - 1];
            } else {
                need = EXP_NEEDED[i];
            }

            if ((currentExp - need) < 0) {
                // Zvýšena přesnost na 6 desetinných míst (1000000)
                return Math.round((level + (currentExp / need)) * 1000000) / 1000000;
            }
            level += 1;
            currentExp -= need;
        }
        return 1000;
    }

     static getSbMode(mode) {
        if (!mode) return 'Normal';
        return mode.toLowerCase()
            .replace('island', 'Stranded')
            .replace('bingo', 'Bingo')
            .replace('ironman', 'Ironman');
    }

    static getCataLvl(exp) {
        if (!exp) return 0;
        if (exp >= 569809640) return 50;
        // Tabulka pro Cata levely (zjednodušená verze nebo import z constants)
        const levels = sbConstants.dungeon_xp;
        for (let i = 1; i <= 50; i++) {
            if (exp < levels[i]) return i - 1 + (exp - levels[i-1]) / (levels[i] - levels[i-1]);
        }
        return 50;
    }

    static getHotmTier(exp) {
        let tiers = [0, 3000, 12000, 37000, 97000, 197000, 347000, 557000, 847000, 1247000];
        for (let i = 0; i < 10; i++) {
            if (exp < tiers[i]) return i;
        }
        return 7; // Max tier (aktuálně 7 nebo 10 dle update, necháváme safe)
    }

    /**
     * Výpočet SkyBlock Skillů (Aktualizováno pro player_data.experience)
     * @param {Object} player - member data z SkyBlock API (v2)
     * @param {Object} achievements - achievementy z Hypixel Player API (fallback)
     */
    static getSkills(player, achievements = {}) {
        const constants = require('./constants/skyblock');
        const skills = {};
        
        // Data v novém API jsou zanořená v player_data.experience
        const experienceData = player.player_data?.experience || {};
        
        // Seznam skillů ke zpracování
        const skillList = ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'taming', 'carpentry', 'runecrafting', 'social'];

        for (const s of skillList) {
            const skill = { exp: 0, level: 0, exp_current: 0, exp_missing: 0, progress: 0 };
            
            // Sestavení klíče (např. farming -> SKILL_FARMING)
            const apiKey = `SKILL_${s.toUpperCase()}`;
            let exp = experienceData[apiKey];

            // --- FALLBACK NA ACHIEVEMENTY (pokud je Skills API vypnuté) ---
            // nefunguje
            if (exp === undefined || exp === null) {
                const achName = constants.skills_achievements ? constants.skills_achievements[s] : null;
                skill.level = achName ? (achievements[achName] || 0) : 0;
                skills[s] = skill;
                continue;
            }

            exp = Math.floor(exp);
            skill.exp = exp;

            // --- VÝPOČET LEVELU Z EXP ---
            // leveling_xp obsahuje 1-50, xp_past_50 obsahuje 51-60
            const fullXpTable = { ...constants.leveling_xp, ...constants.xp_past_50 };
            const cap = constants.skills_cap[s] || 50;

            let totalExpToCurrentLevel = 0;
            for (let i = 1; i <= cap; i++) {
                const stepExp = fullXpTable[i];
                if (exp >= totalExpToCurrentLevel + stepExp) {
                    totalExpToCurrentLevel += stepExp;
                    skill.level = i;
                } else {
                    break;
                }
            }

            // --- VÝPOČET PROGRESU DO DALŠÍHO LEVELU ---
            const nextLevel = skill.level + 1;
            const nextLevelReq = nextLevel <= cap ? fullXpTable[nextLevel] : 0;

            skill.exp_current = exp - totalExpToCurrentLevel;
            
            if (nextLevelReq > 0) {
                skill.exp_missing = nextLevelReq - skill.exp_current;
                // Procento progresu (na 2 desetinná místa)
                skill.progress = Math.floor((skill.exp_current / nextLevelReq) * 10000) / 100;
            } else {
                // Hráč dosáhl MAX levelu (včetně limitu 60)
                skill.progress = 100;
                skill.exp_missing = 0;
            }

            skills[s] = skill;
        }

        // --- VÝPOČET SKILL AVERAGE (SA) ---
        // Seznam skillů pro průměr (Carpentry se u UHG většinou započítává, Runecrafting a Social ne)
        const saList = ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'taming', 'carpentry'];
        let saSum = 0;
        let tSaSum = 0;

        for (const s of saList) {
            if (skills[s]) {
                saSum += skills[s].level;
                // tSa započítává i desetinný progres z XP (např. 45.87)
                tSaSum += (skills[s].level + (skills[s].progress / 100));
            }
        }

        const count = saList.length || 1;
        return {
            stats: skills,
            sa: Math.floor((saSum / count) * 100) / 100,
            tSa: Math.floor((tSaSum / count) * 100) / 100
        };
    }

    /**
     * Zpracuje Slayer data.
     * @param {Object} slayerBosses - Objekt 'slayer_bosses' z API
     * @returns {Object} Naformátovaná data (total + jednotliví bossové)
     */
    static getSlayers(slayerBosses) {
        if (!slayerBosses) return {};

        const output = {
            total: { level: 0, xp: 0, claimedAll: true, killsTotal: 0 }
        };

        const xpTable = [5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000];
        
        const bosses = {
            zombie:   { name: "Revenant Horror", maxTierIndex: 4 }, // T5
            spider:   { name: "Tarantula Broodfather", maxTierIndex: 3 }, // T4
            wolf:     { name: "Sven Packmaster", maxTierIndex: 3 }, // T4
            enderman: { name: "Voidgloom Seraph", maxTierIndex: 3 }, // T4
            blaze:    { name: "Inferno Demonlord", maxTierIndex: 3 }, // T4
            vampire:  { name: "Riftstalker Bloodfiend", maxTierIndex: 4 } // T5
        };

        let totalLevelSum = 0;
        let bossCount = 0;

        for (const [key, config] of Object.entries(bosses)) {
            const data = slayerBosses[key] || {};
            
            // 1. XP a Level
            const xp = data.xp || 0;
            let level = 0; // Celé číslo (0-9)
            let levelProgress = 0;

            for (let i = 0; i < xpTable.length; i++) {
                if (xp >= xpTable[i]) {
                    level = i + 1;
                } else {
                    break;
                }
            }

            if (level < 9) {
                const currentReq = level === 0 ? 0 : xpTable[level - 1];
                const nextReq = xpTable[level];
                const needed = nextReq - currentReq;
                const have = xp - currentReq;
                levelProgress = have / needed;
            }

            const preciseLevel = level + levelProgress;
            
            // 2. Kills
            let killsTotal = 0;
            for (let i = 0; i <= 5; i++) {
                killsTotal += (data[`boss_kills_tier_${i}`] || 0);
            }
            const killsMaxTier = data[`boss_kills_tier_${config.maxTierIndex}`] || 0;

            // 3. Claimed Levels (Opravená logika)
            // Zjistíme, kolik levelů hráč reálně vybral
            const claimedObj = data.claimed_levels || {};
            const claimedCount = Object.keys(claimedObj).length;

            // Hráč má vše "hotové", pokud počet vyzvednutých odměn odpovídá jeho aktuálnímu levelu.
            // Pokud je Level 5, musí mít 5 záznamů v claimed_levels.
            const claimedAll = claimedCount >= level;

            // 4. Uložení
            output[key] = {
                level: parseFloat(preciseLevel.toFixed(2)),
                xp: xp,
                claimedAll: claimedAll,
                killsTotal: killsTotal,
                killsMaxTier: killsMaxTier,
                maxTier: config.maxTierIndex + 1
            };

            output.total.xp += xp;
            output.total.killsTotal += killsTotal;
            if (!claimedAll) output.total.claimedAll = false; // Pokud chybí u jednoho bosse, chybí celkově
            
            totalLevelSum += preciseLevel;
            bossCount++;
        }

        output.total.level = bossCount > 0 ? parseFloat((totalLevelSum / bossCount).toFixed(2)) : 0;

        return output;
    }

    /**
   * Seřadí pole cakes:
   * 1. Nejdříve neaktivní (expirované).
   * 2. Poté aktivní, seřazené podle času vypršení (od nejbližšího).
   *
   * @param {Array} cakes - Vstupní pole
   * @returns {Array} Nové seřazené pole
   */
  static getCakes(cakes) {
    // 1. Definice všech existujících dortů (aby se vypsaly i ty, co hráč nemá)
    const ALL_CAKE_TYPES = [
        { stat_id: 'mining_fortune', key: 'cake_mining_fortune', amount: 5 },
        { stat_id: 'strength', key: 'cake_strength', amount: 2 },
        { stat_id: 'walk_speed', key: 'cake_walk_speed', amount: 10 },
        { stat_id: 'vitality', key: 'cake_vitality', amount: 1 },
        { stat_id: 'health', key: 'cake_health', amount: 10 },
        { stat_id: 'pet_luck', key: 'cake_pet_luck', amount: 1 },
        { stat_id: 'sea_creature_chance', key: 'cake_sea_creature_chance', amount: 1 },
        { stat_id: 'rift_time', key: 'cake_rift_time', amount: 10 },
        { stat_id: 'magic_find', key: 'cake_magic_find', amount: 1 },
        { stat_id: 'foraging_fortune', key: 'cake_foraging_fortune', amount: 5 },
        { stat_id: 'true_defense', key: 'cake_true_defense', amount: 1 },
        { stat_id: 'farming_fortune', key: 'cake_farming_fortune', amount: 10 },
        { stat_id: 'cold_resistance', key: 'cake_cold_resistance', amount: 1 },
        { stat_id: 'defense', key: 'cake_defense', amount: 3 },
        { stat_id: 'intelligence', key: 'cake_intelligence', amount: 5 }
    ];

    // Ošetření vstupu (pokud je null/undefined, použijeme prázdné pole)
    const inputCakes = cakes || [];
    const now = Date.now();

    // 2. Spojení definic s daty z API
    const mergedList = ALL_CAKE_TYPES.map(defaultCake => {
        // Zkusíme najít dort v datech od hráče
        const found = inputCakes.find(c => c.stat_id === defaultCake.stat_id);
        
        if (found) {
            return found; // Použijeme data z API (včetně expire_at)
        } else {
            // Pokud hráč dort nemá, vrátíme default s expire_at: null
            return { ...defaultCake, expire_at: null };
        }
    });

    // 3. Rozdělení na Active a Inactive
    // Active = má expire_at A je v budoucnosti
    const active = mergedList.filter(c => c.expire_at && c.expire_at > now);
    // Inactive = nemá expire_at NEBO je v minulosti
    const inactive = mergedList.filter(c => !c.expire_at || c.expire_at <= now);

    // 4. Seřazení
    // Active: vzestupně podle času (nejbližší konec nahoře)
    active.sort((a, b) => a.expire_at - b.expire_at);
    // Inactive: abecedně (aby to vypadalo hezky)
    inactive.sort((a, b) => a.stat_id.localeCompare(b.stat_id));

    // 5. Vrácení spojeného pole
    return [...inactive, ...active];
  }

    /**
     * Analyzuje stav dortů pro rychlý přehled.
     * @param {Array} cakes - Pole cakes z API
     * @returns {Object} Souhrn (activeCount, inactiveCount, nextExpiry, nextExpiryFormatted)
     */
    static analyzeCakes(cakes) {
        const sorted = this.getCakes(cakes); // Použije tvou existující metodu pro seřazení
        const now = Date.now();

        const active = sorted.filter(c => c.expire_at && c.expire_at > now);
        const inactive = sorted.filter(c => !c.expire_at || c.expire_at <= now);
        
        // Nejbližší expirace (první v poli active, protože getCakes už řadí od nejbližšího)
        const nextExpiry = active.length > 0 ? active[0].expire_at : null;

        return {
            total: sorted.length,
            activeCount: active.length,
            inactiveCount: inactive.length,
            nextExpiry: nextExpiry,
            // Formátovaný čas do konce (např. "3h 15m")
            nextExpiryRelative: nextExpiry ? this.toTime((nextExpiry - now) / 1000).formatted : "N/A",
            // Bool, zda je vše v pořádku (žádný inactive)
            allActive: inactive.length === 0
        };
    }

    static parseEssence(essenceData) {
        // Pojistka pro případ, že data neexistují
        if (!essenceData) return {};

        const result = {};

        // Projdeme všechny klíče v objektu (DIAMOND, WITHER...)
        for (const key in essenceData) {
            // 1. Převedeme klíč na malá písmena (UNDEAD -> undead)
            // 2. Vytáhneme hodnotu 'current', nebo 0 pokud chybí
            result[key.toLowerCase()] = essenceData[key].current || 0;
        }

        return result;
    }

    /**
     * Převede název dungeon podlaží na zkratku (např. MASTER_CATACOMBS_FLOOR_FIVE -> MM5)
     * @param {string} name - Interní název z API
     * @returns {string} Zkratka (F0-F7 nebo MM1-MM7)
     */
    static getFloorShort(name) {
        if (!name) return "";

        const floors = {
            'ZERO': '0', 'ONE': '1', 'TWO': '2', 'THREE': '3',
            'FOUR': '4', 'FIVE': '5', 'SIX': '6', 'SEVEN': '7'
        };

        // Zjistíme číslo podlaží (poslední slovo v řetězci)
        const parts = name.toUpperCase().split('_');
        const floorWord = parts[parts.length - 1];
        const floorNum = floors[floorWord] || "";

        // Určíme prefix: MASTER_CATACOMBS -> MM, CATACOMBS -> F
        const prefix = name.startsWith('MASTER') ? 'MM' : 'F';

        return prefix + floorNum;
    }

    /**
     * Vypočítá Garden Level z expů.
     * @param {number} exp - Celkové Garden Experience
     * @returns {{level: number, levelProgress: number, all: number}} 
     * - level: Capped level (max 15)
     * - levelProgress: Capped level s desetinami (např. 14.50)
     * - all: Uncapped level (např. 18.25)
     */
    static getGardenLevel(exp) {
        if (!exp || isNaN(exp)) return { level: 0, levelMin: 0, all: 0 };

        // Tabulka XP potřebných pro dosažení daného levelu
        // Index 0 = XP pro Level 1 (0 XP)
        // Index 1 = XP pro Level 2 (100 XP)
        // ...
        const xpTable = [
            0,      // Level 1
            70,    // Level 2
            140,    // Level 3
            280,    // Level 4
            520,   // Level 5
            1120,   // Level 6
            2620,   // Level 7
            4620,   // Level 8
            7120,   // Level 9
            10120,   // Level 10
            20120,   // Level 11
            30120,  // Level 12
            40120,  // Level 13
            50120,  // Level 14
            60120   // Level 15 (MAX)
        ];

        let level = 0;
        let flooredLevel = 0; // Celé číslo levelu (1-15)

        // 1. Zjištění dosaženého celého levelu
        for (let i = 0; i < xpTable.length; i++) {
            if (exp >= xpTable[i]) {
                flooredLevel = i + 1; // Index 0 je Level 1
            } else {
                break;
            }
        }

        // 2. Výpočet přesného levelu (float)
        let exactLevel = 0;

        if (flooredLevel >= 15) {
            // Logika pro Uncapped (nad Level 15)
            // Používáme poslední známý interval (Level 14 -> 15 je 10000 XP)
            const maxReq = xpTable[14];
            const lastGap = 10000;
            
            const overflow = exp - maxReq;
            exactLevel = 15 + (overflow / lastGap);
        } else {
            // Logika pro běžné levely (1-14)
            const currentReq = xpTable[flooredLevel - 1];
            const nextReq = xpTable[flooredLevel];
            const needed = nextReq - currentReq;
            const progress = exp - currentReq;
            
            exactLevel = flooredLevel + (progress / needed);
        }

        return {
            levelMin: Math.min(15, Math.floor(exactLevel)), // Oficiální Level (Max 15)
            level: Math.min(15, parseFloat(exactLevel.toFixed(2))), // Oficiální Level + progres
            all: parseFloat(exactLevel.toFixed(2)) // Teoretický nekonečný level
        };
    }

    /**
     * Vypočítá stav Composteru na základě zastaralých dat.
     * @param {Object} data - Objekt composter_data z Hypixel API
     */
    static getComposter(data) {
        if (!data) return {};

        const now = Date.now();
        const lastSave = data.last_save;
        
        // --- 1. KONSTANTY A VYLEPŠENÍ ---
        const speedLvl = data.upgrades?.speed || 0;
        const costLvl = data.upgrades?.cost_reduction || 0;
        const multiDropLvl = data.upgrades?.multi_drop || 0;

        // Čas na jeden cyklus (v sekundách)
        const secondsPerCycle = 600 / (1 + (speedLvl * 0.2));
        // Spotřeba na jeden cyklus
        const omPerCycle = 4000 * (1 - (costLvl * 0.01));
        const fuelPerCycle = 2000;
        // Výnos z jednoho cyklu (Multi-drop zvyšuje průměrný počet vyrobených kusů)
        const yieldPerCycle = 1 + (multiDropLvl * 0.03);


        // --- 2. VÝPOČET STAVU "TEĎ" ---
        const elapsedSeconds = (now - lastSave) / 1000;

        // Maximální možný počet cyklů ze surovin, co jsme měli
        const maxCyclesByOm = data.organic_matter / omPerCycle;
        const maxCyclesByFuel = data.fuel_units / fuelPerCycle;
        const totalPossibleCycles = Math.min(maxCyclesByOm, maxCyclesByFuel);

        // Kolik cyklů reálně proběhlo od uložení do teď
        const actualCyclesSinceSave = Math.min(Math.floor(elapsedSeconds / secondsPerCycle), totalPossibleCycles);

        // Odhad aktuálního množství kompostu (původní + nově vyrobený)
        const currentCompostItems = data.compost_items + Math.floor(actualCyclesSinceSave * yieldPerCycle);
        const compostAtEnd = data.compost_items + Math.floor(totalPossibleCycles * yieldPerCycle);

        // Aktuální suroviny (simulované)
        const simOm = Math.floor(Math.max(0, data.organic_matter - (actualCyclesSinceSave * omPerCycle)));
        const simFuel = Math.floor(Math.max(0, data.fuel_units - (actualCyclesSinceSave * fuelPerCycle)));


        // --- 3. PREDIKCE DO BUDOUCNA ---
        let timeRemainingSec = 0;
        let isActive = true;

        if (simOm < omPerCycle || simFuel < fuelPerCycle) {
            isActive = false; // Došlo to během doby od uložení
        } else {
            const remainingCycles = Math.min(simOm / omPerCycle, simFuel / fuelPerCycle);
            timeRemainingSec = remainingCycles * secondsPerCycle;
        }

        // Pomocná funkce pro Minecraft formát (2hod 21min)
        const formatMcTime = (totalSec) => {
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            if (h > 0) return `${h}hod ${m}min`;
            return `${m}min`;
        };

        return {
            active: isActive,
            compostWaiting: Math.floor(currentCompostItems),
            compostAtEnd: Math.floor(compostAtEnd),
            last_save: lastSave,
            
            // Čas do vyprázdnění (pro MC chat)
            mcTimeRemaining: isActive ? formatMcTime(timeRemainingSec) : "EMPTY",
            
            // Kdy to dojde (pro Discord timestamp)
            emptyAt: Math.floor(isActive ? (now + timeRemainingSec * 1000) : (lastSave + totalPossibleCycles * secondsPerCycle * 1000)),

            resources: {
                om: simOm,
                fuel: simFuel,
                limit: (data.organic_matter / omPerCycle) < (data.fuel_units / fuelPerCycle) ? "Organic Matter" : "Fuel"
            }
        };
    }

    /**
     * Zformátuje text tak, aby první písmeno bylo velké a zbytek malý.
     * @param {string} str - Vstupní text (např. "skyBLOCK" nebo "MASTER")
     * @returns {string} Zformátovaný text (např. "Skyblock" nebo "Master")
     */
    static capitalize(str) {
        if (!str || typeof str !== 'string') return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    /* BEDWARS_CHALLENGER -> Bedwars Challenger*/
    static capitalizeWords(str) {
        if (!str) return "";
        return str.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }




}

module.exports = ApiFunctions;
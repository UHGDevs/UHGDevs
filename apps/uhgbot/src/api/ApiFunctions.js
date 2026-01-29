/**
 * src/api/ApiFunctions.js
 * Kompletní sada funkcí pro výpočty všech her a SkyBlocku na Hypixelu.
 */

const sbConstants = require('./constants/skyblock');

class ApiFunctions {
    // --- ZÁKLADNÍ FORMÁTOVÁNÍ ---
    static f(number, max = 2) {
        if (!Number(number) && number !== 0) return number;
        return Number(number).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: max });
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

    static clear(message) {
        if (!message) return "";
        return message.replace(/§[0-9a-fk-or]/gi, '').replace(/✫|✪|⚝/g, '?').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
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
                return Math.round((level + (currentExp / need)) * 100) / 100;
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

    static getSkills(player, achievements = {}) {
        let skills = {};
        
        // Seznam skillů k výpočtu
        const skillList = sbConstants.skills || ['farming', 'mining', 'combat', 'foraging', 'fishing', 'enchanting', 'alchemy', 'taming', 'carpentry', 'runecrafting', 'social'];

        for (let s of skillList) {
            let skill = { exp: 0, level: 0, exp_current: 0, exp_missing: 0, progress: 0 };

            // Získání EXP z API
            let exp = player[`experience_skill_${s === 'social' ? 'social2' : s}`];
            
            // Fallback na achievementy, pokud je API vypnuté
            if (exp === undefined || exp === null) {
                const achName = sbConstants.skills_achievements[s];
                skill.level = achievements[achName] || 0;
                skills[s] = skill;
                continue;
            }

            exp = Math.floor(exp);
            skill.exp = exp;

            // Výběr správné XP tabulky
            let xpTable = sbConstants[s] || sbConstants.leveling_xp;
            if (!xpTable) xpTable = sbConstants.leveling_xp;

            // Zjištění Level Capu
            let maxLevel = Math.max(...Object.keys(xpTable).map(Number));
            const capConstant = sbConstants.skills_cap[s] || 50;
            
            // Pokud je skill cap vyšší než základní tabulka (např. Farming 60), přidáme post-50 tabulku
            if (capConstant > maxLevel) {
                xpTable = Object.assign({}, sbConstants.xp_past_50, xpTable);
                maxLevel = capConstant;
            }

            let totalLevelExp = 0;
            for (let x = 1; x <= maxLevel; x++) {
                totalLevelExp += xpTable[x];
                if (totalLevelExp > exp) {
                    totalLevelExp -= xpTable[x];
                    break;
                } else {
                    skill.level = x;
                }
            }

            // Výpočet progresu do dalšího levelu
            skill.exp_current = exp - totalLevelExp;
            let nextLevelExp = skill.level < maxLevel ? Math.ceil(xpTable[skill.level + 1]) : 0;
            
            if (skill.level < maxLevel && nextLevelExp > 0) {
                skill.exp_missing = nextLevelExp - skill.exp_current;
                skill.progress = Math.floor((Math.max(0, Math.min(skill.exp_current / nextLevelExp, 1))) * 100);
            } else {
                skill.progress = 0;
                skill.exp_missing = 0;
            }
            
            skills[s] = skill;
        }

        // Výpočet Skill Average (SA)
        let sa = 0;
        let trueSa = 0;
        // Počítáme jen hlavní skilly (bez cosmetics jako Runecrafting/Social/Carpentry)
        const cos = ['runecrafting', 'social', 'carpentry'];
        const mainSkills = skillList.filter(s => !cos.includes(s));
        
        for (let s of mainSkills) {
            if (skills[s]) {
                sa += skills[s].level;
                trueSa += skills[s].level + (skills[s].progress / 100);
            }
        }
        
        const count = mainSkills.length || 1;
        sa = Math.floor((sa / count) * 100) / 100;
        trueSa = Math.floor((trueSa / count) * 100) / 100;

        return { stats: skills, sa: sa, tSa: trueSa };
    }

    static getSlayers(slayerData) {
        if (!slayerData) return {};
        const slayers = {};
        const types = ['zombie', 'spider', 'wolf', 'enderman', 'blaze', 'vampire'];
        const totals = { 1: 5, 2: 15, 3: 200, 4: 1000, 5: 5000, 6: 20000, 7: 100000, 8: 400000, 9: 1000000 };

        let totalSlayerXp = 0;

        for (const type of types) {
            const data = slayerData[`${type}_boss`] || {};
            const exp = data.xp || 0;
            totalSlayerXp += exp;

            let level = 0;
            for (let i = 1; i <= 9; i++) {
                if (exp >= totals[i]) level = i;
                else break;
            }

            slayers[type] = {
                xp: exp,
                level: level,
                kills: Object.values(data).filter(n => typeof n === 'number' && n < 100000).reduce((a,b)=>a+b, 0) // Hrubý odhad killů
            };
        }
        slayers.total_xp = totalSlayerXp;
        return slayers;
    }
}

module.exports = ApiFunctions;
/**
 * src/api/ApiFunctions.js
 * Kompletní sada funkcí pro výpočty všech her na Hypixelu.
 */

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
        const colors = { 'MVP': '#55FFFF', 'MVP+': '#FF5555', 'MVP++': '#FFAA00', 'VIP+': '#55FF55', 'VIP': '#55FF55', 'PIG+++': '#FF55FF', 'OWNER': '#FF5555', 'ADMIN': '#FF5555', 'GM': '#00AA00', 'YOUTUBE': '#FF5555' };
        return colors[rank] || '#BAB6B6';
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
}

module.exports = ApiFunctions;
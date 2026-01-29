/**
 * src/utils/Uhg.js
 */

const { Collection, EmbedBuilder  } = require('discord.js');
const fs = require('fs');
const path = require('path');

const Database = require('./Database');
const Api = require('../api/Api');
const Minecraft = require('../minecraft/Minecraft');
const TimeHandler = require('../time/TimeHandler');
const CommandHandler = require('./CommandHandler');
const LeaderboardHelper = require('./LeaderboardHelper');
const RoleHandler = require('./RoleHandler');

class Uhg {
    constructor(discord) {
        this.dc = { 
            client: discord, 
            commands: new Collection(), 
            slash: new Collection(), 
            aliases: new Collection(),
            cache: { channels: new Collection() },
            Embed: EmbedBuilder 
        };

        this.mc = { 
            client: null, 
            ready: false, 
            send: [],
            commands: new Collection(),
            aliases: new Collection()
        };
        const apsPath = path.resolve(__dirname, '../api/constants/achievements.json');
        this.aps = fs.existsSync(apsPath) ? JSON.parse(fs.readFileSync(apsPath, 'utf8')) : { legacy: {} };

        this.config = {};
        this.setupConfig();
        
        this.db = new Database(this);
        this.api = new Api(this);
        this.time = new TimeHandler(this);
        this.minecraft = new Minecraft(this);
        this.cmds = new CommandHandler(this);
        this.lbHelper = new LeaderboardHelper();
        this.roles = new RoleHandler(this);

        this.getApi = this.api.call.bind(this.api);

        this.bannedWords = this.config.bannedWords || [];
    }

    async init() {
        await this.db.connect();
        await this.cmds.loadAll();
        await this.time.init();
        require('../discord/handler')(this);
    }

    /**
     * Načte config a pokud je dev_mode: true, přepíše hodnoty těmi s příponou _dev
     */
    setupConfig() {
        const configPath = path.resolve(__dirname, '../../config.json');
        
        const defaultConfig = {
            prefix: ".", minecraft: true, dev_mode: false, mc_all_logs: false, activity: "UHG bot",
            guildId: "455751845319802880", guildId_dev: "758650512827613195",
            channels: { guild: "912776277361053758", guild_dev: "957005113149521930", officer: "929435160234053726", officer_dev: "957005146460684299", logs: "548772550386253824", bot: "1017334503066320906", dm: "1466082546587799645" },
            time: {}, database_stale_hours: 200, bannedWords: ["vape", "ip", "fag", "nigger", "negr", "kys", "hitler"]
        };

        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
        }

        // Funkce pro uložení na disk (volaná automatem)
        const saveToDisk = () => {
            try {
                fs.writeFileSync(configPath, JSON.stringify(this._rawConfig, null, 4));
            } catch (e) { console.error("Chyba při zápisu configu:", e); }
        };

        // Funkce pro vytvoření Proxy (hlídače změn)
        const createProxy = (object) => {
            return new Proxy(object, {
                get: (target, prop) => {
                    const value = target[prop];
                    // Pokud jdeme hlouběji (např. config.time), vrátíme taky Proxy, abychom hlídali i vnořené změny
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        return createProxy(value);
                    }
                    return value;
                },
                set: (target, prop, value) => {
                    target[prop] = value;
                    // Jakmile se něco změní v paměti, hned se to uloží na disk
                    saveToDisk(); 
                    return true;
                }
            });
        };

        // Načtení dat
        const load = () => {
            try {
                this._rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                
                // Aplikace Dev Overrides (přepíše hodnoty v _rawConfig)
                if (this._rawConfig.dev_mode) {
                    const applyDev = (obj) => {
                        for (let key in obj) {
                            if (typeof obj[key] === 'object' && obj[key] !== null) applyDev(obj[key]);
                            if (obj[`${key}_dev`] !== undefined) obj[key] = obj[`${key}_dev`];
                        }
                    };
                    applyDev(this._rawConfig);
                }

                // Vytvoření "hlídaného" objektu this.config
                this.config = createProxy(this._rawConfig);

                console.log(` [CONFIG] Načteno. (Dev: ${this._rawConfig.dev_mode})`.cyan);
            } catch (e) { console.error("Chyba při čtení configu!".red); }
        };

        load();

        // Sledování externích změn souboru
        fs.watchFile(configPath, () => {
            console.log(" [CONFIG] Detekována externí změna souboru.".magenta);
            load();
        });
    }

       /** Formátování čísel (např. 1000 -> 1,000) */
    f(n, max = 2) { 
        if (n === undefined || n === null) return "0";
        return Number(n) ? n.toLocaleString('en', { maximumFractionDigits: max }) : n; 
    }

    /** Peněžní formátování (K, M, B) */
    money(n) {
        if (!Number(n)) return n;
        if (n < 1000) return n;
        if (n < 1000000) return Math.floor(n / 100) / 10 + "K";
        if (n < 1000000000) return Math.floor(n / 10000) / 100 + "M";
        return Math.floor(n / 10000000) / 100 + "B";
    }

    /** Výpočet poměru (KDR/WLR) */
    ratio(n1 = 0, n2 = 0, n3 = 2) {
        return Number(Number(isFinite(n1 / n2) ? (n1 / n2) : n1).toLocaleString('en', {maximumFractionDigits: n3}));
    }

    /** Formátování času ze sekund */
    toTime(sec, ms = false) {
        if (ms) sec = sec / 1000;
        let d = Math.floor(sec / 86400);
        let h = Math.floor((sec % 86400) / 3600);
        let m = Math.floor((sec % 3600) / 60);
        let s = Math.floor(sec % 60);
        return { formatted: `${d}d ${h}h ${m}m ${s}s`, d, h, m, s };
    }

    /** Odstranění barev (§) a řídících znaků z MC zpráv */
    clear(msg) { 
        if (!msg) return "";
        return msg
            .replace(/§[0-9a-fk-or]/gi, '')
            .replace(/✫|✪|⚝/g, '?')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
            .trim(); 
    }

    /** 
     * Ochrana proti formátování v Discordu (ZDE BYLA CHYBA)
     */
    dontFormat(text) {
        if (!text) return "";
        return String(text).replace(/[*_~>`|]/g, "\\$&");
    }

    filterMessage(text) {
        if (!text) return false;
        const clean = text.toLowerCase();
        
        // Projdeme seznam zakázaných slov
        for (let word of (this.config.bannedWords || [])) {
            // \b znamená hranice slova (mezera, interpunkce, začátek/konec řádku)
            // g = globálně, i = ignorovat velikost písmen
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            
            if (regex.test(clean)) {
                console.log(`[FILTER] Zablokováno slovo: "${word}" ve zprávě: "${text}"`.yellow);
                return true;
            }
        }
        return false;
    }

    /** Získání hodnoty z objektu pomocí cesty "a/b/c" */
    path(p, obj) { 
        return p.split('/').filter(n => n).reduce((o, n) => (o && o[n] !== undefined) ? o[n] : undefined, obj);
    }

    /** Deep merge objektů nastavení */
    mergeSettings(def, given) {
        if (!given) return def;
        for (const key in def) {
            if (!Object.hasOwn(given, key) || given[key] === undefined) given[key] = def[key];
            else if (given[key] === Object(given[key])) given[key] = this.mergeSettings(def[key], given[key]);
        }
        return given;
    }

    /** Kontrola práv uživatele */
    handlePerms(perms, interaction) {
        if (!perms || !perms.length) return true;
        const id = interaction.user?.id || interaction.author?.id;
        const member = interaction.member;
        return perms.some(p => {
            if (p.type === 'USER') return p.id === id;
            if (p.type === 'ROLE') return member?._roles?.includes(p.id);
            return false;
        });
    }

    /** Pomocné zpoždění */
    delay(ms) { return new Promise(res => setTimeout(res, ms)); }

    getAvatar(uuid) {
        // Varianta A: Visage (Velmi kvalitní, podporuje 3D hlavy)
        return `https://visage.surgeplay.com/face/512/${uuid}`;
        
        // Varianta B: Minotar (Klasická záloha)
        // return `https://minotar.net/helm/${uuid}/100.png`;
        
        // Varianta C: Mc-Heads
        // return `https://mc-heads.net/avatar/${uuid}`;
    }

    /*
     * Vypočítá roli pro badge.
     * Tuto funkci si volají soubory v src/utils/badges pomocí:
     * info.getRole = uhg.getBadgeRoles
     */

    getBadgeRoles(name, api) {
        const badge = this;
        if (!api || !api.stats) return { name: badge.name, role: { name: 'Žádná role' }, tier: -1 };

        let stats = badge.stats.map(statKey => {
            let fullPath = (badge.path || "") + statKey;
            let cleanPath = fullPath
                .replace(/^hypixel\//, '')
                .replace(/\//g, '.')
                .replace(/\.\./g, '.')
                .replace(/^\.|\.$/g, '');

            const val = cleanPath.split('.').reduce((o, k) => (o || {})[k], api);
            return (val !== undefined && val !== null) ? Number(val) : 0;
        });

        let tierResults = stats.map((val, i) => {
            const reqs = badge.req[i];
            if (val >= reqs[2]) return 2; // God
            if (val >= reqs[1]) return 1; // Expert
            if (val >= reqs[0]) return 0; // Trained
            return -1;
        });

        // Nejnižší dosažený tier napříč všemi staty v kategorii
        let roleIndex = Math.min(...tierResults);
        let roleToGet = (roleIndex >= 0 && badge.roles[roleIndex]) ? badge.roles[roleIndex] : null;

        return {
            name: badge.name,
            role: roleToGet || { name: 'Žádná role' },
            tier: roleIndex // Přidáváme tier pro snadnější zobrazení v příkazu
        };
    }

    /**
     * Deaktivuje všechna tlačítka a menu ve zprávě.
     * @param {Object} interaction - Discord interakce
     * @param {string|null} newContent - (Volitelné) Nový text zprávy. Pokud null, nechá původní.
     */
    async disableAllComponents (interaction) {
        const newComponents = interaction.message.components.map(row => {
            const rawRow = row.toJSON();
            rawRow.components = rawRow.components.map(component => {
                component.disabled = true;
                return component;
            });
            return rawRow;
        });
        try {
            await interaction.message.edit({ components: newComponents });
        } catch (e) {}
    }
}

module.exports = Uhg;
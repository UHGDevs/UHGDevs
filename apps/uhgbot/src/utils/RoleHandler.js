/**
 * src/utils/RoleHandler.js
 * Správa Discord rolí (Guild Ranky + Badges + Verified)
 */
const fs = require('fs');
const path = require('path');

class RoleHandler {
    constructor(uhg) {
        this.uhg = uhg;
        this.badges = [];

        // KONFIGURACE ROLÍ
        this.roles = {
            // 1. Guild Ranky (Role, které dostaneš podle ranku v /g list)
            guild: {
                "Guild Master": "530504567528620063",
                "Guild General": "475585340762226698",
                "Guild Manager": "537252847025127424", 
                "Guild Officer": "530504766225383425",
                "Elite Member": "537255964898754571",
                "Member": "530504032708460584"
            },
            
            // 2. Verified Role (Dostane KAŽDÝ, kdo je v databázi)
            verified: "478816107222925322" 
        };
    }

    async loadBadges() {
        const guild = this.uhg.dc.client.guilds.cache.get(this.uhg.config.guildId);
        if (!guild) return console.log(" [ROLES] Nelze načíst badges - Guilda nenalezena.".red);
        
        const trueBadgePath = path.resolve(__dirname, 'badges');

        if (!fs.existsSync(trueBadgePath)) return console.log(" [ROLES] Složka badges nenalezena.".yellow);

        const files = fs.readdirSync(trueBadgePath).filter(f => f.endsWith('.js'));
        this.badges = [];

        for (const file of files) {
            delete require.cache[require.resolve(path.join(trueBadgePath, file))];
            try {
                const badgeModule = require(path.join(trueBadgePath, file));
                
                // --- KLÍČOVÁ ČÁST: SPUŠTĚNÍ SETUPU ---
                if (typeof badgeModule.setup === 'function') {
                    // Předáme 'this.uhg' a discord guildu
                    const badgeInfo = badgeModule.setup(this.uhg, guild);
                    if (badgeInfo) this.badges.push(badgeInfo);
                }
            } catch (e) { 
                console.error(` [ROLES] Chyba badge ${file}:`, e.message); 
            }
        }
        console.log(` [ROLES] Načteno ${this.badges.length} systémů pro odznáčky.`.green);
    }

    async updateMember(discordId) {
        const guild = this.uhg.dc.client.guilds.cache.get(this.uhg.config.guildId);
        if (!guild) return false;

        let member;
        try { member = await guild.members.fetch(discordId); } catch (e) { return false; }
        if (!member) return false;

        // 1. Získání verifikace z DB
        const verify = await this.uhg.db.getVerify(discordId);
        
        // A. NENÍ VERIFIKOVANÝ -> CLEANUP
        if (!verify) {
            if (member.roles.cache.has(this.roles.verified)) {
                await member.roles.remove(this.roles.verified).catch(() => {});
            }
            for (const id of Object.values(this.roles.guild)) {
                if (member.roles.cache.has(id)) await member.roles.remove(id).catch(() => {});
            }
            // Odebrání badge rolí
            const allBadgeRoles = this.badges.map(b => b.ids).flat();
            for (const id of allBadgeRoles) {
                 if (member.roles.cache.has(id)) await member.roles.remove(id).catch(() => {});
            }
            return false; 
        }

        // B. JE VERIFIKOVANÝ
        if (!member.roles.cache.has(this.roles.verified)) {
            await member.roles.add(this.roles.verified).catch(() => {});
        }

        // 2. Získání STATS z DB (Místo API volání)
        // Toto je ta data, která tam sype 'database.js'
        const stats = await this.uhg.db.getStats(verify.uuid);

        // 3. Získání GUILD dat z DB (Místo API volání)
        // Toto jsou data, která tam sype 'guildinfo.js' (běží každých 5 min, takže je to fresh)
        // Předpokládáme, že řešíme primárně UHG guildu
        const dbGuild = await this.uhg.db.run.get("stats", "guild", { name: "UltimateHypixelGuild" }).then(n => n[0]);
        
        // Zjistíme, jestli je členem
        let guildInfo = { guild: false };
        if (dbGuild) {
            const gMember = dbGuild.members.find(m => m.uuid == verify.uuid);
            if (gMember) {
                guildInfo = {
                    guild: true,
                    name: "UltimateHypixelGuild",
                    // Rank bereme z DB (guildinfo.js ho tam ukládá)
                    member: { rank: gMember.rank } 
                };
            }
        }

        // 4. Aplikace změn
        await this.applyGuildRoles(member, guildInfo);
        
        // Badges aplikujeme jen pokud máme statistiky v DB
        if (stats) {
            // Připravíme data pro badges (root + stats)
            const hypixelData = { ...stats, stats: stats.stats };
            await this.applyBadgeRoles(member, hypixelData);
        }

        // 5. Update Nickname (použijeme jméno z verify tabulky, která se taky aktualizuje)
        await this.updateNickname(member, verify.nickname);

        return true;
    }

    async applyGuildRoles(member, guildData) {
        const guildRoles = Object.values(this.roles.guild);
        let roleToAdd = null;

        if (guildData && guildData.guild && guildData.name === "UltimateHypixelGuild") {
            const rank = guildData.member.rank; 
            const roleId = this.roles.guild[rank];
            if (roleId) roleToAdd = roleId;
        }

        for (const id of guildRoles) {
            if (id === roleToAdd) {
                if (!member.roles.cache.has(id)) await member.roles.add(id).catch(() => {});
            } else {
                if (member.roles.cache.has(id)) await member.roles.remove(id).catch(() => {});
            }
        }
    }

    async applyBadgeRoles(member, hypixelStats) {
        if (!hypixelStats || !hypixelStats.stats) return;

        // Pokud je stat v DB uložen jako "365", ale badges potřebují přesný formát, 
        // zde se spoléháme na to, že v DB je to uložené správně z parserů.

        for (const badge of this.badges) {
            if (typeof badge.getRole === 'function') {
                try {
                    const result = badge.getRole(badge.name, hypixelStats);
                    
                    const allBadgeRoles = badge.ids || []; 
                    const targetRole = result.role && result.role.id ? result.role.id : null;

                    for (const id of allBadgeRoles) {
                        if (id === targetRole) {
                            if (!member.roles.cache.has(id)) await member.roles.add(id).catch(() => {});
                        } else {
                            if (member.roles.cache.has(id)) await member.roles.remove(id).catch(() => {});
                        }
                    }
                } catch (e) {
                    console.error(`Chyba v badge ${badge.name}:`, e);
                }
            }
        }
    }

    async updateNickname(member, username) {
        if (member.id === member.guild.ownerId) return;
        // Přidáme kontrolu na manageNicknames permisi bota
        if (!member.guild.members.me.permissions.has('ManageNicknames')) return;
        
        if (member.nickname !== username) {
            await member.setNickname(username).catch(e => {
                // Ignorujeme chybu, pokud má uživatel vyšší roli než bot
                if (e.code !== 50013) console.error(`Nešlo změnit nick pro ${member.user.tag}`);
            });
        }
    }
}

module.exports = RoleHandler;
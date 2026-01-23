/**
 * src/utils/RoleHandler.js
 * Správa Discord rolí (Guild Ranky + Badges + Verified)
 */
const fs = require('fs');
const path = require('path');
const { PermissionFlagsBits } = require('discord.js');

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
        
        const badgePath = path.resolve(__dirname, 'badges');
        if (!fs.existsSync(badgePath)) return;
        const files = fs.readdirSync(badgePath).filter(f => f.endsWith('.js'));
        this.badges = [];

        for (const file of files) {
            delete require.cache[require.resolve(path.join(badgePath, file))];
            try {
                const badgeModule = require(path.join(badgePath, file));
                
                if (typeof badgeModule.setup === 'function') {
                    const badgeInfo = badgeModule.setup(this.uhg, guild);
                    if (badgeInfo) this.badges.push(badgeInfo);
                }
            } catch (e) { 
                console.error(` [ROLES] Chyba badge ${file}:`, e.message); 
            }
        }
        console.log(` [ROLES] Načteno ${this.badges.length} systémů pro odznáčky.`.green);
    }

    /**
     * @param {string|GuildMember} memberOrId - ID nebo objekt člena
     * @param {object} [preloadedVerify] - (Volitelné) Data z verify DB. Pokud null, znamená "nenalezen". Pokud undefined, stáhne se.
     * @param {object} [preloadedGuild] - (Volitelné) Data guildy z DB.
     */
    async updateMember(memberOrId, preloadedVerify = undefined, preloadedGuild = undefined) {
        const guild = this.uhg.dc.client.guilds.cache.get(this.uhg.config.guildId);
        if (!guild) return false;

        let member;
        // Pokud jsme dostali ID, stáhneme člena. Pokud objekt, použijeme ho.
        if (typeof memberOrId === 'string') {
            try { member = await guild.members.fetch(memberOrId); } catch (e) { return false; }
        } else {
            member = memberOrId;
        }
        if (!member) return false;

        // Pomocná funkce pro bezpečné přidání role
        const safeAdd = async (roleId) => {
            if (!member.roles.cache.has(roleId)) {
                // Kontrola hierarchie: Může bot tuto roli spravovat?
                const role = member.guild.roles.cache.get(roleId);
                if (role && role.editable) { 
                    await member.roles.add(roleId).catch(() => {});
                    return true;
                }
            }
            return false;
        };

        // Pomocná funkce pro bezpečné odebrání role
        const safeRemove = async (roleId) => {
            if (member.roles.cache.has(roleId)) {
                const role = member.guild.roles.cache.get(roleId);
                if (role && role.editable) {
                    await member.roles.remove(roleId).catch(() => {});
                    return true;
                }
            }
            return false;
        };


        // 1. Získání verifikace (Cache/DB nebo Přednačteno)
        let verify = preloadedVerify;
        if (verify === undefined) {
            verify = await this.uhg.db.getVerify(member.id);
        }
        
        let changed = false;
        
        // A. NENÍ VERIFIKOVANÝ -> CLEANUP
        if (!verify) {
            if (await safeRemove(this.roles.verified)) changed = true;
            for (const id of Object.values(this.roles.guild)) {
                if (await safeRemove(id)) changed = true;
            }
            const allBadgeRoles = this.badges.map(b => b.ids).flat();
            for (const id of allBadgeRoles) {
                 if (await safeRemove(id)) changed = true;
            }
            // Zde bychom mohli resetovat nick, ale to nebudeme počítat jako API change pro delay
            return changed; 
        }

        // B. JE VERIFIKOVANÝ
        if (await safeAdd(this.roles.verified)) changed = true;

        // 2. Data o guildě (DB nebo Přednačteno)
        let dbGuild = preloadedGuild;
        if (dbGuild === undefined) {
            dbGuild = await this.uhg.db.run.get("stats", "guild", { name: "UltimateHypixelGuild" }).then(n => n[0]);
        }
        
        // 3. Data o statistikách (DB)
        const stats = await this.uhg.db.getStats(verify.uuid);

        // Zjistíme, jestli je členem guildy
        let guildInfo = { guild: false };
        if (dbGuild) {
            const gMember = dbGuild.members.find(m => m.uuid == verify.uuid);
            if (gMember) {
                guildInfo = { guild: true, name: "UltimateHypixelGuild", member: { rank: gMember.rank } };
            }
        }

        // 1. Guild Roles
        const guildRolesValues = Object.values(this.roles.guild);
        let roleToAdd = null;
        if (guildInfo.guild) roleToAdd = this.roles.guild[guildInfo.member.rank];

        if (guildInfo.guild) {
            const rank = guildInfo.member.rank;
            if (this.roles.guild[rank]) roleToAdd = this.roles.guild[rank];
        }

        const memberRoleId = this.roles.guild["Member"];
        for (const id of guildRolesValues) {
            // Pokud je to role odpovídající ranku NEBO je to Member role a uživatel je v guildě (roleToAdd není null)
            if (id === roleToAdd || (roleToAdd !== null && id === memberRoleId)) {
                 if (await safeAdd(id)) changed = true; 
            } else { 
                 if (await safeRemove(id)) changed = true; 
            }
        }
        
        // 2. Badges
        if (stats) {
            const hypixelData = { ...stats, stats: stats.stats };
            for (const badge of this.badges) {
                if (typeof badge.getRole === 'function') {
                    try {
                        const result = badge.getRole(badge.name, hypixelData);
                        const allBadgeRoles = badge.ids || []; 
                        const targetRole = result.role && result.role.id ? result.role.id : null;

                        for (const id of allBadgeRoles) {
                            if (id === targetRole) { if (await safeAdd(id)) changed = true; } 
                            else { if (await safeRemove(id)) changed = true; }
                        }
                    } catch (e) {}
                }
            }
        }
        
        // 3. Nickname (Optimalizováno)
        const nChanged = await this.updateNickname(member, verify.nickname);
        if (nChanged) changed = true;

        // 4. Split Roles (Optimalizováno s kontrolou editable)
        const sChanged = await this.applySplitRoles(member);
        if (sChanged) changed = true;

        return changed;
    }

    async applyGuildRoles(member, guildData) {
        let changed = false;
        
        const safeAdd = async (roleId) => {
            if (!member.roles.cache.has(roleId)) {
                const role = member.guild.roles.cache.get(roleId);
                if (role && role.editable) {
                    await member.roles.add(roleId).catch(() => {});
                    return true;
                }
            }
            return false;
        };

        const safeRemove = async (roleId) => {
            if (member.roles.cache.has(roleId)) {
                const role = member.guild.roles.cache.get(roleId);
                if (role && role.editable) {
                    await member.roles.remove(roleId).catch(() => {});
                    return true;
                }
            }
            return false;
        };

        const guildRoles = Object.values(this.roles.guild);
        let roleToAdd = null;

        if (guildData && guildData.guild && guildData.name === "UltimateHypixelGuild") {
            const rank = guildData.member.rank; 
            const roleId = this.roles.guild[rank];
            if (roleId) roleToAdd = roleId;
        }

        const memberRoleId = this.roles.guild["Member"];

        for (const id of guildRoles) {
            if (id === roleToAdd || (roleToAdd !== null && id === memberRoleId)) {
                if (await safeAdd(id)) changed = true;
            } else {
                if (await safeRemove(id)) changed = true;
            }
        }
        return changed;
    }

    async applyBadgeRoles(member, hypixelStats) {
        if (!hypixelStats || !hypixelStats.stats) return false;
        let changed = false;

        const safeAdd = async (roleId) => {
            if (!member.roles.cache.has(roleId)) {
                const role = member.guild.roles.cache.get(roleId);
                if (role && role.editable) {
                    await member.roles.add(roleId).catch(() => {});
                    return true;
                }
            }
            return false;
        };

        const safeRemove = async (roleId) => {
            if (member.roles.cache.has(roleId)) {
                const role = member.guild.roles.cache.get(roleId);
                if (role && role.editable) {
                    await member.roles.remove(roleId).catch(() => {});
                    return true;
                }
            }
            return false;
        };

        for (const badge of this.badges) {
            if (typeof badge.getRole === 'function') {
                try {
                    const result = badge.getRole(badge.name, hypixelStats);
                    
                    const allBadgeRoles = badge.ids || []; 
                    const targetRole = result.role && result.role.id ? result.role.id : null;

                    for (const id of allBadgeRoles) {
                        if (id === targetRole) {
                            if (await safeAdd(id)) changed = true;
                        } else {
                            if (await safeRemove(id)) changed = true;
                        }
                    }
                } catch (e) {}
            }
        }
        return changed;
    }

    async updateNickname(member, username) {
        if (!username) return false;
        if (member.id === member.guild.ownerId) return false;
        if (!member.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) return false;
        
        // Bot nemůže měnit nick někomu, kdo má vyšší roli
        if (member.roles.highest.position >= member.guild.members.me.roles.highest.position) return false;

        const currentName = member.nickname || member.user.username;
        if (currentName !== username) {
            try {
                await member.setNickname(username);
                return true; 
            } catch (e) { return false; }
        }
        return false;
    }

    async applySplitRoles(member) {
        let changed = false;

        // Zde pracujeme přímo s objekty rolí, ne jen s ID
        const safeAdd = async (role) => {
            if (!member.roles.cache.has(role.id) && role.editable) {
                await member.roles.add(role).catch(() => {});
                return true;
            }
            return false;
        };

        const safeRemove = async (role) => {
            if (member.roles.cache.has(role.id) && role.editable) {
                await member.roles.remove(role).catch(() => {});
                return true;
            }
            return false;
        };

        const splitRoles = [...member.guild.roles.cache.filter(r => r.name.includes('▬▬')).values()]
            .sort((a, b) => b.position - a.position);

        const positions = splitRoles.map(r => r.position);

        for (let i = 0; i < splitRoles.length; i++) {
            const splitRole = splitRoles[i];
            const upperLimit = positions[i];
            const lowerLimit = positions[i + 1] || 0;

            const hasRoleInSection = member.roles.cache.some(r => 
                r.position < upperLimit && 
                r.position > lowerLimit && 
                r.id !== member.guild.id
            );

            if (hasRoleInSection) {
                if (await safeAdd(splitRole)) changed = true;
            } else {
                if (await safeRemove(splitRole)) changed = true;
            }
        }
        return changed;
    }
}

module.exports = RoleHandler;
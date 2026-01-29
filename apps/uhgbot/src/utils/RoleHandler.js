/**
 * src/utils/RoleHandler.js
 * Kompletní správa Discord rolí, přezdívek a oddělovačů kategorií.
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
            guild: {
                "Guild Master": "530504567528620063",
                "Guild General": "475585340762226698",
                "Guild Manager": "537252847025127424", 
                "Guild Officer": "530504766225383425",
                "Elite Member": "537255964898754571",
                "Member": "530504032708460584"
            },
            verified: "478816107222925322" 
        };
    }

    /**
     * Načte všechny definice odznáčků ze složky badges
     */
    async loadBadges() {
        const guild = this.uhg.dc.client.guilds.cache.get(this.uhg.config.guildId);
        if (!guild) return console.log(" [ROLES] Nelze načíst badges - Guilda nenalezena.".red);
        
        const badgePath = path.resolve(__dirname, 'badges');
        if (!fs.existsSync(badgePath)) return;
        const files = fs.readdirSync(badgePath).filter(f => f.endsWith('.js'));
        this.badges = [];

        for (const file of files) {
            try {
                const filePath = path.join(badgePath, file);
                delete require.cache[require.resolve(filePath)];
                const badgeModule = require(filePath);
                
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
     * HLAVNÍ METODA: Aktualizuje uživatele kompletně
     * @param {GuildMember} member - Discord člen
     * @param {Object} userData - Data z users kolekce (může být null)
     * @param {Array} activeMembersList - Seznam z uhg.db.getOnlineMembers()
     */
    async updateMember(member, userData, activeMembersList = []) {
        // Pokud bota někdo omezil v právech nebo je to někdo nad ním, nic neuděláme
        if (!member || !member.manageable) return false;

        let changed = false;

        // 1. VERIFIED ROLE
        const hasVerifiedRole = member.roles.cache.has(this.roles.verified);
        const shouldHaveVerified = !!(userData && userData.discordId);

        if (shouldHaveVerified && !hasVerifiedRole) {
            await member.roles.add(this.roles.verified).catch(() => {});
            changed = true;
        } else if (!shouldHaveVerified && hasVerifiedRole) {
            await member.roles.remove(this.roles.verified).catch(() => {});
            changed = true;
        }

        // Pokud uživatel není verifikovaný, dál nepokračujeme (resetujeme nick a smažeme zbytek v budoucnu)
        if (!userData) {
            // Odebrání všech herních a guildovních rolí pro jistotu
            const gChanged = await this.applyGuildRoles(member, null);
            const bChanged = await this.applyBadgeRoles(member, null);
            return changed || gChanged || bChanged;
        }

        // 2. GUILD ROLES
        const gData = activeMembersList.find(m => m.uuid === userData._id);
        if (await this.applyGuildRoles(member, gData)) changed = true;

        // 3. BADGE ROLES
        if (await this.applyBadgeRoles(member, userData)) changed = true;

        // 4. NICKNAME
        if (await this.updateNickname(member, userData.username)) changed = true;

        // 5. SPLIT ROLES (▬▬▬) - Toto dává serveru hezký vzhled
        if (await this.applySplitRoles(member)) changed = true;

        return changed;
    }

    /**
     * Pomocná metoda pro Guild Ranky
     */
    async applyGuildRoles(member, gData) {
        let changed = false;
        const targetRoleId = gData ? this.roles.guild[gData.rank] : null;
        const memberRoleId = this.roles.guild["Member"];

        for (const [rank, roleId] of Object.entries(this.roles.guild)) {
            const role = member.guild.roles.cache.get(roleId);
            if (!role || !role.editable) continue;

            const shouldHave = (roleId === targetRoleId) || (targetRoleId && roleId === memberRoleId);

            if (shouldHave && !member.roles.cache.has(roleId)) {
                await member.roles.add(roleId).catch(() => {});
                changed = true;
            } else if (!shouldHave && member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId).catch(() => {});
                changed = true;
            }
        }
        return changed;
    }

    /**
     * Pomocná metoda pro Odznáčky
     */
    async applyBadgeRoles(member, userData) {
        if (!userData || !userData.stats) return false;
        let changed = false;

        for (const badge of this.badges) {
            if (typeof badge.getRole === 'function') {
                const result = badge.getRole(badge.name, userData);
                const targetRoleId = result.role?.id || null;

                for (const roleDef of badge.roles) {
                    const role = member.guild.roles.cache.get(roleDef.id);
                    if (!role || !role.editable) continue;

                    if (role.id === targetRoleId) {
                        if (!member.roles.cache.has(role.id)) {
                            await member.roles.add(role.id).catch(() => {});
                            changed = true;
                        }
                    } else if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role.id).catch(() => {});
                        changed = true;
                    }
                }
            }
        }
        return changed;
    }

    /**
     * Aktualizace přezdívky
     */
    async updateNickname(member, username) {
        if (!username || member.guild.ownerId === member.id) return false;
        if (member.nickname === username) return false;
        
        try {
            await member.setNickname(username);
            return true;
        } catch (e) { return false; }
    }

    /**
     * SPLIT ROLES: Automaticky přidává/ořezává oddělovače kategorií.
     * Logika: Pokud máš jakoukoliv roli mezi dvěma oddělovači, dostaneš ten horní oddělovač.
     */
    async applySplitRoles(member) {
        let changed = false;
        
        // Najdeme všechny role, které v názvu mají ▬▬
        const splitRoles = [...member.guild.roles.cache.filter(r => r.name.includes('▬▬')).values()]
            .sort((a, b) => b.position - a.position);

        const positions = splitRoles.map(r => r.position);

        for (let i = 0; i < splitRoles.length; i++) {
            const splitRole = splitRoles[i];
            if (!splitRole.editable) continue;

            const upperLimit = positions[i];
            const lowerLimit = positions[i + 1] || 0;

            // Má uživatel nějakou roli v tomto "bloku" mezi oddělovači?
            const hasRoleInBlock = member.roles.cache.some(r => 
                r.position < upperLimit && 
                r.position > lowerLimit && 
                r.id !== member.guild.id
            );

            if (hasRoleInBlock && !member.roles.cache.has(splitRole.id)) {
                await member.roles.add(splitRole).catch(() => {});
                changed = true;
            } else if (!hasRoleInBlock && member.roles.cache.has(splitRole.id)) {
                await member.roles.remove(splitRole).catch(() => {});
                changed = true;
            }
        }
        return changed;
    }
}

module.exports = RoleHandler;
/**
 * src/time/events/uhgrole.js
 * Aktualizace rolí čistě z databáze (žádné zbytečné API cally).
 */

module.exports = {
  name: "uhgrole",
  description: "Aktualizace rolí z DB (Guild Ranky + Badges)",
  emoji: '🛡️',
  time: '0 1 * * * *',
  onstart: false,
  run: async (uhg) => {
    console.log(` [ROLES] `.bgBlue.black + ` Startuji update rolí z DB...`.blue);
    
    const guild = uhg.dc.client.guilds.cache.get(uhg.config.guildId);
    if (!guild) return;

    // 1. Načtení dat z DB
    const dbGuild = await uhg.db.run.get("stats", "guild", { name: "UltimateHypixelGuild" }).then(n => n[0]);
    
    if (!dbGuild) return console.log(" [ROLES] UHG data nejsou v DB.".yellow);

    const guildMembers = dbGuild.members;
    const verifiedUsers = await uhg.db.run.get("general", "verify");
    
    const dcMembers = await guild.members.fetch();
    let updatedCount = 0;

    for (const [id, member] of dcMembers) {
        if (member.user.bot) continue;

        const verify = verifiedUsers.find(v => v._id == id);
        if (!verify) continue;

        // --- A) GUILD ROLE (Z DB) ---
        const gMember = guildMembers.find(m => m.uuid == verify.uuid);
        
        let guildInfo = { guild: false };
        if (gMember) {
            guildInfo = {
                guild: true,
                name: "UltimateHypixelGuild",
                member: { rank: gMember.rank } // Rank z DB
            };
        }
        await uhg.roles.applyGuildRoles(member, guildInfo);

        // --- B) BADGES (Z DB Stats) ---
        const stats = await uhg.db.getStats(verify.uuid);
        if (stats) {
            const hypixelData = { ...stats, stats: stats.stats }; 
            await uhg.roles.applyBadgeRoles(member, hypixelData);
        }

        // --- C) NICKNAME ---
        await uhg.roles.updateNickname(member, verify.nickname);
        
        updatedCount++;
    }
    
    console.log(` [ROLES] `.bgGreen.black + ` Hotovo. (${updatedCount} users)`.green);
  }
};
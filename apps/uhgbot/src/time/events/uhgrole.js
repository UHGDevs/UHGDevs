/**
 * src/time/events/uhgrole.js
 * Synchronizace rolí a přezdívek čistě z DB kolekce 'users'.
 */

module.exports = {
  name: "uhgrole",
  description: "Aktualizace rolí z DB (Guild Ranky + Badges + Nicknames)",
  emoji: '🛡️',
  time: '0 1 * * * *', // Každou hodinu v 1. minutě
  onstart: false,
  run: async (uhg) => {
    const start = Date.now();
    console.log(` [ROLES] Spouštím synchronizaci rolí...`.blue);
    
    const guild = uhg.dc.client.guilds.cache.get(uhg.config.guildId);
    if (!guild) return;

    try {
        // 1. ZÍSKÁNÍ AKTIVNÍCH ČLENŮ UHG (Projekce)
        const activeMembers = await uhg.db.getOnlineMembers("UltimateHypixelGuild");
        
        // 2. NAČTENÍ VŠECH VERIFIKOVANÝCH (Abychom věděli, komu updatovat badges/nick)
        const allVerified = await uhg.db.find("users", { discordId: { $exists: true } });

        // 3. FETCH DISCORD ČLENŮ
        const dcMembers = await guild.members.fetch();
        let updatedCount = 0;
        let changesCount = 0;

        for (const [id, member] of dcMembers) {
            if (member.user.bot) continue;

            // Najdeme data uživatele v našem DB listu
            const userData = allVerified.find(u => u.discordId === id);

            // Zavoláme updateMember
            // userData obsahuje .stats pro badges a .username pro přezdívku
            // activeMembers obsahuje rank v guildě
            const changed = await uhg.roles.updateMember(member, userData, activeMembers);

            if (changed) {
                changesCount++;
                await uhg.delay(1000); // Prevence Rate Limitu
            } 
            updatedCount++;
        }
        
        console.log(` [ROLES] Hotovo. (Check: ${updatedCount}, Změny: ${changesCount}) za ${((Date.now() - start) / 1000).toFixed(2)}s`.green);
    } catch (e) {
        console.error(" [ROLES ERROR] ".bgRed, e);
    }
  }
};
/**
 * src/time/events/uhgrole.js
 * Aktualizace rolí čistě z databáze (žádné zbytečné API cally).
 */

module.exports = {
  name: "uhgrole",
  description: "Aktualizace rolí z DB (Guild Ranky + Badges + nicknames)",
  emoji: '🛡️',
  time: '0 1 * * * *',
  onstart: false,
  run: async (uhg) => {
    const start = Date.now();
    console.log(` [ROLES] `.bgBlue.black + ` Startuji update rolí z DB...`.blue);
    
    const guild = uhg.dc.client.guilds.cache.get(uhg.config.guildId);
    if (!guild) return;

    // 1. Načtení dat z DB
    const dbGuild = await uhg.db.run.get("stats", "guild", { name: "UltimateHypixelGuild" }).then(n => n[0]);
    const allVerify = await uhg.db.run.get("general", "verify");
    if (!dbGuild || !allVerify) return console.log(" [ROLES] Chyba při načítání dat.".yellow);

    console.log(` [ROLES] Data připravena za ${((Date.now() - start) / 1000).toFixed(2)}s. Zpracovávám členy...`.gray);

    const dcMembers = await guild.members.fetch();
    let updatedCount = 0;
    let changesCount = 0;

    for (const [id, member] of dcMembers) {
        if (member.user.bot) continue;

        const verifyData = allVerify.find(v => v._id == id) || null;

        const changed = await uhg.roles.updateMember(member, verifyData, dbGuild);

        if (changed) {
            changesCount++;
            await uhg.delay(1000); 
        } 
        
        updatedCount++;
    }
    
    const totalTime = ((Date.now() - start) / 1000).toFixed(2);
    console.log(` [ROLES] `.bgGreen.black + ` Hotovo za ${totalTime}s. (Check: ${updatedCount}, Změny: ${changesCount})`.green);
  }
};
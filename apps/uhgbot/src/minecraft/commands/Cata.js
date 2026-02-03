module.exports = {
    name: "Cata",
    aliases: ["cata", "catacombs"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {profileName: pmsg.profilName});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;



            let dungeons = profil.dungeons
            let mcMessage = `Cata: [${dungeons.level}] **${api.username}** ${profil.name} - ${uhg.f(dungeons.secrets)} Secrets | ${uhg.f(dungeons.secretsratio)} Secrets/Run | ${uhg.f(dungeons.mobkills || 0)} Kills | ${uhg.func.capitalize(dungeons.currentClass)} |  ${dungeons.lastRun}`

            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Cata: `.red, e);
            return "Chyba v catacombs commandu.";
        }
    }
};


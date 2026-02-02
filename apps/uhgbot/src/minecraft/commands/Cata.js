module.exports = {
    name: "Cata",
    aliases: ["cata", "catacombs"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"]);
            if (!api.success) return api.reason;

            let profilName = uhg.getSbProfile(pmsg.args)
            let profil = profilName ? api.skyblock.profiles.find(n => n.name == profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${profilName || ", žádný nemá"}**`;


            let dungeons = profil.dungeons
            let mcMessage = `Cata: [${dungeons.level}] **${api.username}** ${profil.name} - ${uhg.f(dungeons.secrets)} Secrets | ${uhg.f(dungeons.secretsratio)} Secrets/Run | ${uhg.f(dungeons.mobkills || 0)} Kills | ${uhg.capitalize(dungeons.currentClass)} |  ${dungeons.lastRun}`

            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Cata: `.red, e);
            return "Chyba v catacombs commandu.";
        }
    }
};


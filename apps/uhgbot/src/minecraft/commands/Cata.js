module.exports = {
    name: "Cata",
    aliases: ["cata", "catacombs"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"]);
            if (!api.success) return api.reason;

            let dungeons = api.skyblock.profiles[0].dungeons
            let mcMessage = `Cata: [${dungeons.level}] **${api.username}** - ${uhg.f(dungeons.secrets)} Secrets | ${uhg.f(dungeons.secretsratio)} Secrets/Run | ${uhg.f(dungeons.mobkills || 0)} Kills | ${uhg.capitalize(dungeons.currentClass)} |  ${dungeons.lastRun}`

            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Cata: `.red, e);
            return "Chyba při načítání cata statistik.";
        }
    }
};


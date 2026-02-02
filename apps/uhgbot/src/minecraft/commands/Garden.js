module.exports = {
    name: "Garden",
    aliases: ["garden"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {garden: true, profileName: pmsg.profilName, cachePath: 'skyblock/profiles[0]/garden/composter', all: false});
            if (!api.success) return api.reason;

            let profilName = uhg.getSbProfile(pmsg.args)
            let profil = profilName ? api.skyblock.profiles.find(n => n.name == profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${profilName || ", žádný nemá"}**`;
            if (!profil.garden.composter) return `U hráče **${api.username}** se mi nepodařilo načíst garden data`; 
            let mcMessage = `Garden: [${uhg.f(profil.garden.levelInfinitive)}] **${api.username}** ${profil.name} - ${uhg.f(profil.skills.farming.level)} Farming Level | ${uhg.f(profil.garden.copper)} Copper | ${uhg.f(profil.garden.visitors)} Visitors | ${uhg.f(profil.garden.unique)} Unique Visitors | ${(profil.garden.composter.mcTimeRemaining)} Composter`

            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Garden: `.red, e);
            return "Chyba v garden commandu.";
        }
    }
};


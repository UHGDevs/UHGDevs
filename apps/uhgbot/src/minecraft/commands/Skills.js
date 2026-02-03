module.exports = {
    name: "Skills",
    aliases: ["skill", "sa", "skilly"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"],  {profileName: pmsg.profilName});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;

            if (!profil.apis.skill) return `Skills: **${api.username}** ${profil.name} - skills api je vypnuté`
            let mcMessage = `Skills: [${uhg.f(profil.skill_average)} SA] **${api.username}** ${profil.name} - Tam ${uhg.f(profil.skills.taming.level)}, Mine ${uhg.f(profil.skills.mining.level)}, Forag ${uhg.f(profil.skills.foraging.level)}, Ench ${uhg.f(profil.skills.enchanting.level)}, Carp ${uhg.f(profil.skills.carpentry.level)}, Farm ${uhg.f(profil.skills.farming.level)}, Combat ${uhg.f(profil.skills.combat.level)}, Fish ${uhg.f(profil.skills.fishing.level)}, Alch ${uhg.f(profil.skills.alchemy.level)}, Rune ${uhg.f(profil.skills.runecrafting.level)}, Social ${uhg.f(profil.skills.social.level)}`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Skills: `.red, e);
            return "Chyba v skills commandu.";
        }
    }
};


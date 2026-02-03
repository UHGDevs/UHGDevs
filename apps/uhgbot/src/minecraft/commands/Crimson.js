module.exports = {
    name: "Crimson",
    aliases: ["crimson", "nether", "dojo", "kuudra", "faction", "trophies", "trophyfish", "rep", "crimsonisle"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {profileName: pmsg.profilName});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;


            let mcMessage = `Crimson: [${uhg.f(profil.skills.combat.level)}] **${api.username}** ${profil.name} - ${uhg.f(profil.crimson.rep)} Rep |  ${uhg.f(profil.crimson.kuudras)} Kuudras killed | ${uhg.f(profil.crimson.dojo)} Dojo Pts | ${uhg.f(profil.crimson.trophies)} Trophy Fish | ${uhg.func.capitalize(profil.crimson.fraction)} Faction`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Crimson: `.red, e);
            return "Chyba v crimson commandu.";
        }
    }
};


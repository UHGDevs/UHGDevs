module.exports = {
    name: "End",
    aliases: ["end", "dragon", "drag", "soulflow"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"]);
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;


            let mcMessage = `End: [${uhg.f(profil.skills.combat.level)}] **${api.username}** ${profil.name} - ${uhg.f(profil.end.eyes)} Eyes collected | ${uhg.f(profil.end.eyes_placed)} Eyes placed |  ${uhg.f(profil.end.drags)} Drag summoned | ${uhg.f(profil.drag.soulflow)} Soulflow`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command End: `.red, e);
            return "Chyba v end commandu.";
        }
    }
};


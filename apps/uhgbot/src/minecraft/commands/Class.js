module.exports = {
    name: "Class",
    aliases: ["ca", "class", "casses", "classaverage"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {profileName: pmsg.profilName});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;


            let dungeons = profil.dungeons

            let mcMessage = `Class: [${uhg.f(dungeons.classavg)} CA] **${api.username}** ${profil.name} - H: ${dungeons.classes.healer} | M: ${dungeons.classes.mage} | B: ${dungeons.classes.berserk} | A: ${dungeons.classes.archer} | T: ${dungeons.classes.tank} (${dungeons.level} Cata)`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Class: `.red, e);
            return "Chyba v class commandu.";
        }
    }
};


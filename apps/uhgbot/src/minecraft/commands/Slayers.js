module.exports = {
    name: "Slayers",
    aliases: ["slayers", "slayer"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {profileName: pmsg.profilName});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;
            let mcMessage = `Slayers: [${uhg.money(profil.slayers.total.xp)}] **${api.username}** ${profil.name}: Rev ${uhg.f(profil.slayers.zombie.level)} - ${uhg.money(profil.slayers.zombie.xp, 2)} | Tara ${uhg.f(profil.slayers.spider.level)} - ${uhg.money(profil.slayers.spider.xp, 2)} | Sven ${uhg.f(profil.slayers.wolf.level)} - ${uhg.money(profil.slayers.wolf.xp, 2)} | Voidgloom ${uhg.f(profil.slayers.enderman.level)} - ${uhg.money(profil.slayers.enderman.xp, 2)} | Inferno ${uhg.f(profil.slayers.blaze.level)} - ${uhg.money(profil.slayers.blaze.xp, 2)} | Vampire ${uhg.f(profil.slayers.vampire.level)} - ${uhg.money(profil.slayers.vampire.xp, 2)}${profil.slayers.total.claimedAll ? "" :" | Chybí claimnout lvlup!"}`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Slayers: `.red, e);
            return "Chyba v slayers commandu.";
        }
    }
};


module.exports = {
    name: "Mining",
    aliases: ["mining", "powder", "gemstone", "mithril", "glacite", "hotm", "nucleus", "comms", "commissions", "scatha"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {profileName: pmsg.profilName});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;

            let mining = profil.mining

            let cmd = [
                'Mining:',
                profil.apis.skills ? ` [${uhg.f(profil.skills.mining.level)}]` : null,
                ` **${api.username}** ${profil.name}`,
                ` - HOTM ${mining.hotm_tier == 1 ? 'chybí v api' : mining.hotm_tier}`,
                mining.nucleus ? ` | ${uhg.f(mining.nucleus)} Nucleus`: null,
                mining.scatha ? ` | ${uhg.f(mining.scatha)} Scatha`: null,
                mining.commissions ? ` | ${f(mining.commissions)} Comission${mining.commissions == 1 ? '':'s'}`: null,
                mining.powder_mithril ? ` | Powder: ${uhg.money(mining.powder_mithril)} Mithril`: null,
                mining.powder_gemstone ? ` ${uhg.money(mining.powder_gemstone)} Gemstone`: null,
                mining.powder_glacite ? ` ${uhg.money(mining.powder_glacite)} Glacite`: null,
                mining.mineshafts ? ` ${uhg.f(mining.mineshafts)} Mineshafts`: null,
                profil.collection.gemstone_collection || profil.collection.hard_stone ? ' | Collection:' : null,
                profil.collection.gemstone_collection ? ` ${uhg.money(profil.collection.gemstone_collection)} Gemstone` : null,
                profil.collection.gemstone_collection && profil.collection.hard_stone ? ',': null,
                profil.collection.hard_stone ? ` ${uhg.money(profil.collection.hard_stone)} HardStone` : null,
            ].filter(n => n)
            let mcMessage = cmd.join('')
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Mining: `.red, e);
            return "Chyba v mining commandu.";
        }
    }
};


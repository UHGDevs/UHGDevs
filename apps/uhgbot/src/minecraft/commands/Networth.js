module.exports = {
    name: "Networth",
    aliases: ["networth", "nw"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"], {networth: true, profileName: pmsg.profilName, cachePath: `skyblock/profiles[${pmsg.profilName ? `name=${pmsg.profilName}` : 'selected=true'}]/networth/total`, all:null});
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;

            let types = profil.networth.types;
            let mcMessage = `NetWorth: [${uhg.money(profil.bank.networth, 2)}] **${api.username}** ${profil.name} - ${uhg.money(profil.bank.total, 2)} Money | ${uhg.money(types.wardrobe.total, 2)} Wardrobe | ${uhg.money(types.accessories.total, 2)} Accessories | ${uhg.money(types.pets.total, 2)} Pets | ${uhg.money(types.museum.total, 2)} Museum | ${uhg.money(types.inventory.total+types.enderchest.total+types.storage.total, 2)} Inv+Stor+Neth | ${uhg.money(types.sacks.total, 2)} Sacks`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Networth: `.red, e);
            return "Chyba v networth commandu.";
        }
    }
};


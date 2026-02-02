module.exports = {
    name: "Coins",
    aliases: ["coins", "purse", "bank", "coin"],
    sb: true,
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["skyblock"]);
            if (!api.success) return api.reason;

            let profil = pmsg.profilName ? api.skyblock.profiles.find(n => n.name == pmsg.profilName) : api.skyblock.profiles[0]
            if (!profil) return `U hráče **${api.username}** jsem nenašel profil **${pmsg.profilName || ", žádný nemá"}**`;


            let mcMessage = `Coins: [${uhg.money(profil.bank.total, 2)}] **${api.username}** ${profil.name} - Purse: ${profil.apis.purse ? uhg.money(profil.bank.purse) : 'api off'} | Bank: ${profil.apis.bank ? uhg.money(profil.bank.bank) : 'api off'} | Personal: ${profil.apis.bank ? uhg.money(profil.bank.personal) : 'api off'}`
            return mcMessage;
        } catch (e) {
            console.error(` [ERROR] MC Command Coins: `.red, e);
            return "Chyba v coins commandu.";
        }
    }
};


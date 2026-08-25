const ApiFunctions = require('../../api/ApiFunctions');

module.exports = {
    name: "Cakes",
    aliases: ["cakes", "cake", "dorty"],
    run: async (uhg, pmsg) => {
        try {
            const args = pmsg.args.split(" ");
            const subCommands = ["on", "off"];
            let subCommand = "";
            if (subCommands.includes(args[0]?.toLowerCase())) subCommand = args[0].toLowerCase();
            else if (subCommands.includes(args[1]?.toLowerCase())) subCommand = args[1].toLowerCase();
            
            const verify = await uhg.db.getVerify(pmsg.username);
            if (!verify) return `Hráč **${pmsg.username}** není verifikovaný.`;
            
            const isAdmin = pmsg.by.toLowerCase() === "davidczpdy";

            // --- VYPNUTÍ ---
            if (subCommand === "off") {
                if (pmsg.username !== pmsg.by && !isAdmin) return "Sledování můžeš vypnout jen sám sobě.";
                await uhg.db.db.collection("users").updateOne(
                    { _id: verify.uuid },
                    { $unset: { cakes: "" } }
                );
                uhg.db.cache.users.del(verify.uuid);
                return `Sledování New Year Cakes pro **${pmsg.username}** bylo vypnuto.`;
            }

            // --- ZÍSKÁNÍ DAT ---
            const profileArg = uhg.getSbProfile(args) || null;
            const api = await uhg.api.call(verify.uuid, ["skyblock"]);
            if (!api.success) return `Chyba API: ${api.reason}`;

            let profile = null;
            if (profileArg) {
                profile = api.skyblock.profiles.find(p => p.name.toLowerCase() === profileArg.toLowerCase());
            } else {
                // Pokud uživatel už má nastavený profil v DB, zkusíme ten
                const userInDb = await uhg.db.getUser(verify.uuid);
                const savedProfileId = userInDb?.cakes?.profile_id;
                
                if (savedProfileId) profile = api.skyblock.profiles.find(p => p.id === savedProfileId);
                if (!profile) profile = api.skyblock.profiles.find(p => p.selected) || api.skyblock.profiles[0];
            }

            if (!profile) return `Profil nenalezen.`;

            const cakesData = profile.cakes || [];
            const analysis = ApiFunctions.analyzeCakes(cakesData);

            // --- ULOŽENÍ DO DB (Update expirace) ---
            // Ukládáme to vždy při zavolání příkazu, pokud uživatel už má tracking zapnutý, 
            // nebo pokud ho právě zapíná pomocí "on"
            const userInDb = await uhg.db.getUser(verify.uuid);
            const isTracking = userInDb?.cakes?.tracking || subCommand === "on";

            if (isTracking) {
                const updateData = {
                    "cakes.tracking": true,
                    "cakes.profile_id": profile.id,
                    "cakes.profile_name": profile.name,
                    "cakes.nextExpiry": analysis.nextExpiry || 0,
                    "cakes.hasInactive": analysis.inactiveCount > 0,
                    "cakes.alert_sent": false
                };
                await uhg.db.updateOne("users", { _id: verify.uuid }, updateData);
            }
            
            // --- VÝPIS ---
            if (subCommand === "on") {
                if (pmsg.username !== pmsg.by && !isAdmin) return "Sledování můžeš zapnout jen sám sobě.";
                return `Sledování pro **${pmsg.username}** zapnuto (Profil: ${profile.name}). Upozorním ho po připojení, pokud budou docházet.`;
            }

            let msg = `Cakes (${profile.name}): ${analysis.activeCount}/${analysis.total} Aktivní. `;
            if (!analysis.allActive) msg += `⚠️ ${analysis.inactiveCount} neaktivních! `;
            else msg += `✅ Vše OK. `;

            if (analysis.nextExpiry) msg += `Další končí za: ${analysis.nextExpiryRelative}.`;
            return msg;

        } catch (e) {
            console.error(e);
            return "Chyba při příkazu Cakes.";
        }
    }
};
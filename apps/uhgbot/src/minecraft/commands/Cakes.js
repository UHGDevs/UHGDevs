const ApiFunctions = require('../../api/ApiFunctions');

module.exports = {
    name: "Cakes",
    aliases: ["cakes", "cake", "dorty"],
    run: async (uhg, pmsg) => {
        try {
            const args = pmsg.args.split(" ");
            const subCommand = args[0] ? args[0].toLowerCase() : "";
            
            const verify = await uhg.db.getVerify(pmsg?.verify_data?._id);
            if (!verify) return "Nejsi verifikovaný.";
            
            // --- VYPNUTÍ ---
            if (subCommand === "off") {
                await uhg.db.db.collection("users").updateOne(
                    { _id: verify.uuid },
                    { $unset: { cakes: "" } }
                );
                uhg.db.cache.users.del(verify.uuid);
                return "Sledování New Year Cakes bylo vypnuto.";
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
            // Ukládáme to vždy při zavolání příkazu, aby byla DB aktuální
            const updateData = {
                "cakes.tracking": true,
                "cakes.profile_id": profile.id,
                "cakes.profile_name": profile.name,
                "cakes.nextExpiry": analysis.nextExpiry || 0, // Čas expirace nebo 0
                "cakes.hasInactive": analysis.inactiveCount > 0,
                "cakes.alert_sent": false
            };

            await uhg.db.updateOne("users", { _id: verify.uuid }, updateData);
            
            // --- VÝPIS ---
            if (subCommand === "on") {
                return `Sledování zapnuto (Profil: ${profile.name}). Upozorním tě po připojení, pokud budou docházet.`;
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
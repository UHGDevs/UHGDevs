/**
 * src/time/events/composter.js
 */

module.exports = {
    name: "compost",
    description: "Kontrola garden composterů",
    emoji: "🍎",
    time: "0 */10 * * * *", // Každých 10 minut
    onstart: false,
    run: async (uhg) => {
        const now = Date.now();

        // 1. Najdeme v DB kandidáty, kterým už MĚL čas vypršet
        const candidates = await uhg.db.find("users", {
            "garden.composter_alert": true,
            "garden.alert_sent": false,
            "garden.emptyAt": { $lt: now }
        });
        if (!candidates.length) return;
        

        for (const user of candidates) {
            try {
                // 2. RE-VALIDACE: Zavoláme API pro čerstvá data
                // Použijeme waitSave: true, aby se nový stav rovnou propsal do users kolekce
                const api = await uhg.api.call(user._id, ["skyblock"], {garden: true, profileName: user.garden.profileName, cachePath: 'skyblock/profiles[0]/garden/level', all: false});
                if (!api.success || !api.skyblock?.profiles[0]?.garden?.composter) continue; // Pokud API selže, zkusíme to v dalším běhu (za 10 min)

                // 3. PŘEPOČET: Zjistíme skutečný aktuální stav
                const freshCalc = api.skyblock?.profiles[0]?.garden.composter

                // 4. ROZHODNUTÍ
                if (freshCalc.active && freshCalc.emptyAt > now + 60000) continue;

                // Pokud je stále prázdný (nebo dojde do 1 minuty), pošleme DM
                const dcUser = await uhg.dc.client.users.fetch(user.discordId).catch(() => null);
                if (dcUser) {
                    const embed = new uhg.dc.Embed()
                        .setTitle("🍎 Tvůj Composter je prázdný!")
                        .setColor("Orange")
                        .setDescription(`**${user.username}** composter na SkyBlocku právě přestal pracovat.\n\nBěž ho doplnit, ať ti neuteče žádný profit!`)
                        .addFields(
                            { name: "Nasbíráno", value: `\`${freshCalc.compostWaiting} ks, ${uhg.money(freshCalc.prices.now)}\``, inline: true },
                        )
                        .setTimestamp();

                    await dcUser.send({ embeds: [embed] }).catch(() => {
                        // Pokud má zavřené DMs, vypneme mu alert
                        uhg.db.updateOne("users", { _id: user._id }, { "garden.composter_alert": false });
                    });
                }

                // Označíme jako odeslané (případně se resetuje při dalším /composter notify:true)
                await uhg.db.updateOne("users", { _id: user._id }, { "garden.alert_sent": true });
                
            } catch (e) {
                console.error(` [COMPOSTER ERROR] ${user.username}: ${e.message}`);
            }
            await uhg.delay(2000);
        }
    }
};
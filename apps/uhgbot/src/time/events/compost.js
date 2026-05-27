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

        // 1. Najdeme v DB kandidáty, kterým už MĚL čas vypršet NEBO potřebují refresh dat (každé 2h)
        const candidates = await uhg.db.find("users", {
            "garden.composter_alert": true,
            $or: [
                { "garden.alert_sent": false, "garden.emptyAt": { $lt: now } },
                { "garden.alert_sent": true, $or: [ { "garden.last_refresh": { $lt: now - 7200000 } }, { "garden.last_refresh": { $exists: false } } ] }
            ]
        });
        if (!candidates.length) return;
        

        for (const user of candidates) {
            try {
                // 2. RE-VALIDACE: Zavoláme API pro čerstvá data
                const api = await uhg.api.call(user._id, ["skyblock"], {garden: true, profileName: user.garden?.profileName, cachePath: `skyblock/profiles[${user.garden?.profileName ? `name=${user.garden.profileName}` : 'selected=true'}]/garden/composter`, all: false});
                if (!api.success || !api.skyblock?.profiles[0]?.garden?.composter) continue;

                // 3. PŘEPOČET: Zjistíme skutečný aktuální stav
                const freshCalc = api.skyblock?.profiles[0]?.garden.composter

                // 4. ROZHODNUTÍ
                // Pokud je kompostér aktivní a má čas (došlo k refresh), resetujeme alert
                if (freshCalc.active && freshCalc.emptyAt > now + 60000) {
                    await uhg.db.updateOne("users", { _id: user._id }, { 
                        "garden.alert_sent": false, 
                        "garden.emptyAt": freshCalc.emptyAt,
                        "garden.last_refresh": now
                    });
                    continue;
                }

                // Pokud už byl alert poslán, jen aktualizujeme čas refreshu a končíme
                if (user.garden?.alert_sent) {
                    await uhg.db.updateOne("users", { _id: user._id }, { "garden.last_refresh": now });
                    continue;
                }

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

                // Označíme jako odeslané a uložíme čas refreshu
                await uhg.db.updateOne("users", { _id: user._id }, { "garden.alert_sent": true, "garden.last_refresh": now });
                
            } catch (e) {
                console.error(` [COMPOSTER ERROR] ${user.username}: ${e.message}`);
            }
            await uhg.delay(2000);
        }
    }
};
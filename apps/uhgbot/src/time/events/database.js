/**
 * src/time/events/database.js
 * Automatická údržba users databáze s nastavitelným intervalem.
 */

module.exports = {
    name: "database",
    description: "Aktualizace jmen a statistik s nastavitelným intervalem (stale hours)",
    emoji: "💻",
    time: "0 */15 * * * *", // Každých 15 minut
    onstart: false,
    run: async (uhg) => {
        const logsChannel = uhg.dc.cache.channels.get('logs');
        const now = Date.now();
        
        // --- LOGIKA INTERVALU Z CONFIGU ---
        // 0 = Catch-up mode (všechny projet)
        // 200 = Údržba (jen starší než 200h)
        const staleHours = uhg.config.database_stale_hours || 0;
        const staleTimestamp = now - (staleHours * 3600000);
        
        const LIMIT = 40; 

        try {
            /**
             * Vybíráme hráče, kteří mají stats.updated starší než staleTimestamp.
             * Řadíme od nejstarších, aby se fronta hýbala.
             */
            let queue = await uhg.db.db.collection("users")
                .find({ 
                    "stats.updated": { $lt: staleTimestamp } 
                })
                .sort({ "stats.updated": 1 }) 
                .limit(LIMIT)
                .toArray();

            // Pokud v režimu údržby nikdo takto starý v DB není, končíme bez logování
            if (!queue.length) return;

            console.log(` [DATABASE] Aktualizuji ${queue.length} hráčů (Mode: ${staleHours}h)...`.blue);

            let results = { 
                success: 0, 
                error: 0, 
                names: [], // Pro změny jmen
                updatedList: [] // Pro seznam zpracovaných
            };

            for (let player of queue) {
                // Voláme API (to v sobě spustí _smartSave v Api.js)
                const api = await uhg.api.call(player._id, ["hypixel"]);

                if (api.success) {
                    results.success++;
                    results.updatedList.push(api.username);

                    // Kontrola změny jména v DB
                    if (player.username && api.username.toLowerCase() !== player.username.toLowerCase()) {
                        results.names.push(`\`${player.username}\` ➜ \`${api.username}\``);
                    }
                } else {
                    results.error++;
                    // PROTI ZACYKLENÍ: I u chyby updatneme timestamp, aby hráč neblokoval začátek fronty
                    await uhg.db.db.collection("users").updateOne(
                        { _id: player._id },
                        { $set: { "stats.updated": now, updated: now } }
                    );
                    console.log(` [DATABASE] Chyba u ${player.username || player._id}: ${api.reason}`.red);
                }

                // API Rate Limit Protection
                await uhg.delay(1200);
            }

            // ============================================================
            // DISCORD LOGGING
            // ============================================================
            if (logsChannel && (results.success > 0 || results.error > 0)) {
                const embed = new uhg.dc.Embed()
                    .setTitle("🔄 Údržba Statistik a Jmen")
                    .setDescription(`Režim: \`${staleHours}h stale\` | Limit: \`${LIMIT}\``)
                    .setColor(results.error > 10 ? "Orange" : "Green")
                    .addFields(
                        { name: "Úspěšně", value: `✅ ${results.success}`, inline: true },
                        { name: "Chyby", value: `❌ ${results.error}`, inline: true }
                    )
                    .setTimestamp();

                // Seznam aktualizovaných jmen (pokud jich není moc, aby se vešlo do Embedu)
                if (results.updatedList.length > 0) {
                    let listStr = results.updatedList.join(", ");
                    if (listStr.length > 1000) listStr = listStr.slice(0, 1000) + "...";
                    embed.addFields({ name: "Zpracovaní hráči", value: `\`\`\`${listStr}\`\`\`` });
                }

                // Výpis detekovaných změn jmen
                if (results.names.length > 0) {
                    embed.addFields({ 
                        name: "📝 Změny jmen v DB", 
                        value: results.names.join('\n').slice(0, 1024) 
                    });
                }

                // Pokud jsme v catch-up módu (stale=0), přidáme info, kolik jich zbývá
                if (staleHours === 0) {
                    const remaining = await uhg.db.db.collection("users").countDocuments({ "stats.updated": { $lt: now - 3600000 } }); // starší než 1h
                    embed.setFooter({ text: `Zbývá cca ${remaining} hráčů k první aktualizaci.` });
                }

                await logsChannel.send({ embeds: [embed] });
            }

        } catch (e) {
            console.error(" [DATABASE ERROR] ".bgRed, e);
            if (logsChannel) logsChannel.send(`⚠️ **Database Event Error:** \`${e.message}\``);
        }
    }
};
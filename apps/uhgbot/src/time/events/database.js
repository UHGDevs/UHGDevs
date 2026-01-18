/**
 * src/time/events/database.js
 * Automatická aktualizace CZ/SK databáze statistik.
 */

module.exports = {
    name: "database",
    description: "Pravidelná aktualizace statistik hráčů v databázi",
    emoji: "💻",
    time: "0 */15 * * * *", // Každých 15 minut
    ignore: "* * * * * *", // Ignoruj v noci (00:00 - 05:59)
    onstart: false,
    run: async (uhg) => {
        const logsChannel = uhg.dc.cache.channels.get('logs');
        
        let now = Date.now();
        let successCount = 0;
        let errorCount = 0;
        let nameChanges = [];

        // 1. Získání fronty (Hráči, kteří nebyli aktualizováni více než 48 hodin)
        // Seřazeno od nejstarších (updated: 1)
        let updateQueue = await uhg.db.mongo.db("stats").collection("stats")
            .find({ updated: { $lt: now - (3600000 * 48) } })
            .sort({ updated: 1 })
            .limit(40) // 40 hráčů každých 15 minut = ~3800 hráčů denně
            .toArray();

        if (!updateQueue.length) return;

        console.log(` [DATABASE] `.bgBlue + ` Startuji update ${updateQueue.length} hráčů...`.blue);

        for (let player of updateQueue) {
            // Voláme sjednocené API
            let api = await uhg.api.call(player.uuid, ["hypixel"]);
            
            if (api.success && api.hypixel) {
                successCount++;

                // 2. KONTROLA ZMĚNY JMÉNA
                // Pokud se jméno v API liší od toho v DB statistikách
                if (player.username !== api.username) {
                    nameChanges.push(`\`${player.username}\` ➜ \`${api.username}\``);
                    
                    // Opravíme jméno v kolekci verify, pokud tam uživatel je
                    await uhg.db.mongo.db("general").collection("verify").updateOne(
                        { uuid: player.uuid },
                        { $set: { nickname: api.username } }
                    );
                }
            } else {
                errorCount++;
                // Pokud hráč neexistuje (smazaný účet), můžeme ho v budoucnu označit, ale teď jen logujeme
                console.log(` [DATABASE] Chyba u ${player.username}: ${api.reason}`.red);
            }

            // 3. API LIMIT PROTECTION
            // Hypixel limit je sice vysoký, ale rozložením requestů předejdeme "lagování" bridge
            await uhg.delay(1500); 
        }

        // 4. INFORMOVÁNÍ NA DISCORDU
        if (logsChannel && (successCount > 0 || errorCount > 0)) {
            const embed = new uhg.dc.Embed()
                .setTitle("Pravidelná aktualizace statistik")
                .setColor(errorCount > 10 ? "Orange" : "Green")
                .addFields(
                    { name: "Aktualizováno", value: `✅ ${successCount} hráčů`, inline: true },
                    { name: "Chyby", value: `❌ ${errorCount}`, inline: true }
                )
                .setTimestamp();

            if (nameChanges.length > 0) {
                embed.addFields({ name: "Detekované změny jmen", value: nameChanges.join('\n').slice(0, 1024) });
            }

            logsChannel.send({ embeds: [embed] });
        }
    }
};
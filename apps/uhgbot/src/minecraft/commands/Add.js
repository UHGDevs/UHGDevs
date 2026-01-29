/**
 * src/minecraft/commands/Add.js
 */

module.exports = {
    name: "Add",
    aliases: ["add"],
    run: async (uhg, pmsg) => {
        try {
            const authorized = ["Farmans", "Honzu", "unisdynasty", "DavidCzPdy", "SolidL1m3", "Smolda", "Corruptedoslav", "macek2005"];
            if (!authorized.includes(pmsg.username)) return "Nemáš oprávnění!";

            let target = pmsg.args.split(" ")[0];
            if (!target) return "Nezadal jsi jméno!";

            // 1. Stáhneme data z API
            let api = await uhg.api.call(target, ["hypixel"]);
            if (!api.success) return `Chyba: ${api.reason}`;

            // 2. EXPLICITNĚ uložíme do databáze (jelikož je to ADD příkaz)
            // Použijeme tvou metodu z Database.js
            const data = {
                _id: api.uuid,
                uuid: api.uuid,
                username: api.username,
                created_at: api.created_at || null,
                stats: api.hypixel.stats
            };
            await uhg.db.saveUser(api.uuid, data);

            // 3. Odpovědi
            let mcMessage = `Hráč ${api.username} byl přidán do CZ/SK databáze.`;
            let dcEmbed = new uhg.dc.Embed()
                .setTitle("Hráč přidán do databáze")
                .setColor("Green")
                .addFields(
                    { name: "Jméno", value: `${uhg.dontFormat(api.username)}`, inline: true },
                    { name: "UUID", value: `\`${api.uuid}\``, inline: true }
                );

            return { mc: mcMessage, dc: dcEmbed };

        } catch (e) {
            console.error(e);
            return "Chyba při přidávání.";
        }
    }
}
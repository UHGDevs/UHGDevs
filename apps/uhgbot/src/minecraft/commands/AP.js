/**
 * src/minecraft/commands/AP.js
 * Zobrazí Achievement Points hráče (včetně Legacy bodů).
 */

module.exports = {
    name: "AP",
    aliases: ["ap", "aps", "achievements", "achievement"],
    run: async (uhg, pmsg) => {
        try {
            // 1. Získání dat z API (v4 sjednocený call)
            // 'hypixel' call v pozadí spustí general.js a všechny ostatní parsery
            let api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            let hypixel = api.hypixel?.stats?.general;
            if (!hypixel) return "Nepodařilo se načíst statistiky z Hypixel API.";

            // V nové struktuře (kde general.js je root) jsou tyto hodnoty přímo zde:
            let normalAP = hypixel.aps || 0;
            let legacyAP = hypixel.legacyAps || 0;
            let totalAP = normalAP + legacyAP;

            // 2. Odpověď pro Minecraft (text)
            // Hvězdičky se automaticky odstraní v uhg.minecraft.send()
            let mcMessage = `**${api.username}** - ${uhg.f(normalAP)} AP (${uhg.f(totalAP)} s Legacy)`;

            // 3. Odpověď pro Discord (Embed)
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Achievement Points - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF) // AQUA barva
                .setThumbnail(uhg.getAvatar(uuid))
                .addFields(
                    { name: "Achievement Points", value: `\`${uhg.f(normalAP)}\``, inline: true },
                    { name: "Legacy AP", value: `\`${uhg.f(legacyAP)}\``, inline: true },
                    { name: "Celkem", value: `**${uhg.f(totalAP)}**`, inline: true }
                );

            // Přidání informace o tom, kdo příkaz vyvolal (pokud je dostupné)
            if (pmsg.username) {
                dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });
            }

            return { mc: mcMessage, dc: dcEmbed };

        } catch (e) {
            console.error(` [ERROR] MC Command AP: `.red, e);
            return "Vyskytla se chyba při zpracování Achievementů.";
        }
    }
}
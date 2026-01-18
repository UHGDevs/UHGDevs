/**
 * src/minecraft/commands/BedWars.js
 */

module.exports = {
    name: "BedWars",
    aliases: ["bw", "bedwars"],
    run: async (uhg, pmsg) => {
        try {
            // 1. Získání dat přes sjednocené API
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;
            
            // Pojistka, pokud hráč BedWars nikdy nehrál
            if (!api.hypixel?.stats?.bedwars) {
                return `Hráč **${api.username}** nemá žádné statistiky v BedWars.`;
            }
            
            const bw = api.hypixel.stats.bedwars;
            const overall = bw.overall;

            // 2. Příprava odpovědi pro Minecraft (text)
            // Hvězdičky se automaticky odstraní v uhg.minecraft.send()
            let mcResponse = `BW: ${bw.levelformatted} ${api.username} - ${uhg.f(overall.finalKills)} Finals | ${uhg.f(overall.wins)} Wins | ${uhg.f(overall.fkdr)} FKDR (Main: ${bw.main_mode})`;

            // 3. Příprava odpovědi pro Discord (Embed)
            const dcResponse = new uhg.dc.Embed()
                .setTitle('Bed Wars statistiky')
                .setThumbnail('https://cdn.discordapp.com/attachments/875503798733385779/1000406344156844173/unknown.png')
                .setColor(0x06ACEE) // Hezká modrá barva z tvého configu
                .setDescription(`**${bw.levelformatted} ${uhg.dontFormat(api.username)}**\n\nAktuální Winstreak: \`${overall.winstreak}\``)
                .addFields(
                    { name: 'Zápasy', value: `Výhry: \`${uhg.f(overall.wins)}\`\nProhry: \`${uhg.f(overall.losses)}\`\nWLR: \`${uhg.f(overall.wlr)}\``, inline: true },
                    { name: 'Postele', value: `Zničeno: \`${uhg.f(overall.bedsBroken)}\`\nZtraceno: \`${uhg.f(overall.bedsLost)}\`\nBBLR: \`${uhg.f(overall.bblr)}\``, inline: true },
                    { name: 'ㅤ', value: 'ㅤ', inline: false }, // Oddělovač
                    { name: 'Finální Killy', value: `Killy: \`${uhg.f(overall.finalKills)}\`\nSmrti: \`${uhg.f(overall.finalDeaths)}\`\nFKDR: \`${uhg.f(overall.fkdr)}\``, inline: true },
                    { name: 'Běžné Killy', value: `Killy: \`${uhg.f(overall.kills)}\`\nSmrti: \`${uhg.f(overall.deaths)}\`\nKDR: \`${uhg.f(overall.kdr)}\``, inline: true }
                )
                .setTimestamp();

            // Přidání patičky, pokud příkaz přišel z chatu
            if (pmsg.username) {
                dcResponse.setFooter({ text: `Vyžádal: ${pmsg.username}`, iconURL:uhg.getAvatar(pmsg.verify_data?.uuid || 'steve') });
            }

            return { mc: mcResponse, dc: dcResponse };

        } catch (e) {
            console.error(` [ERROR] MC Command BW: `.red, e);
            return "Došlo k chybě při zpracování BedWars statistik.";
        }
    }
};
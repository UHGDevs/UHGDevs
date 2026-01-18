module.exports = {
    name: "Pit",
    aliases: ["thepit", "pit", "hypixelpit", "renown"], // Sloučeno s renown
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const pit = api.hypixel.stats.pit;
            if (!pit) return "Chybí PIT backend"
            
            // MC: Stručný výpis (Playtime v hodinách)
            let mcMessage = `**Pit**: [${pit.prestigeroman}-${pit.level}] **${api.username}** - Playtime: ${pit.playtime_hours}h - ${uhg.f(pit.gold)}g - Renown: ${uhg.f(pit.renown)}`;

            // DC: Detailní Embed
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`The Pit - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Prestige:** [${pit.prestigeroman}-${pit.level}]\n**Playtime:** ${pit.playtime_formatted}`)
                .addFields(
                    { name: "Gold", value: `\`${uhg.f(pit.gold)}\``, inline: true },
                    { name: "Renown", value: `Current: \`${uhg.f(pit.renown)}\`\nTotal: \`${uhg.f(pit.totalrenown)}\``, inline: true },
                    { name: "Combat", value: `Kills: \`${uhg.f(pit.kills)}\`\nDeaths: \`${uhg.f(pit.deaths)}\`\nKDR: \`${pit.kdr}\``, inline: true },
                    { name: "Other", value: `XP: \`${uhg.f(pit.xp)}\`\nContracts: \`${uhg.f(pit.contracts)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Pit: `.red, e);
            return "Chyba při načítání The Pit statistik.";
        }
    }
};
module.exports = {
    name: "SkyWars",
    aliases: ["sw", "skywars", "rsw"], // Sloučeno s RSW
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const sw = api.hypixel.stats.skywars;
            const overall = sw.overall;
            const ranked = sw.ranked;

            // MC: Základní info
            let mcMessage = `**SkyWars**: [${sw.levelformatted}] **${api.username}** - ${uhg.f(overall.kills)}Kills ${uhg.f(overall.wins)}Wins ${overall.kdr}KDR (Ranked Best: #${uhg.f(ranked.highestpos)} - ${uhg.f(ranked.highestrt)})`;

            // DC: Detailní Embed
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`SkyWars - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Level:** ${sw.levelformatted}\n**Coins:** \`${uhg.f(sw.coins)}\`\n**Souls:** \`${uhg.f(sw.souls)}\``)
                .addFields(
                    { name: "Overall Stats", value: `Wins: \`${uhg.f(overall.wins)}\`\nKills: \`${uhg.f(overall.kills)}\`\nKDR: \`${overall.kdr}\`\nWLR: \`${overall.wlr}\``, inline: true },
                    { name: "Ranked Stats", value: `Rating: Best Rating: \`${uhg.f(ranked.highestrt)}\`\nBest Pos: \`#${uhg.f(ranked.highestpos)}\``, inline: true },
                    { name: "Tokens & Shards", value: `Tokens: \`${uhg.f(sw.tokens)}\`\nShards: \`${uhg.f(sw.shards)}\`\nOpals: \`${uhg.f(sw.opals)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command SkyWars: `.red, e);
            return "Chyba při načítání SkyWars statistik.";
        }
    }
};
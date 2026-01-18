module.exports = {
    name: "Duels",
    aliases: ["duels", "duel"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const duels = api.hypixel.stats.duels;
            
            // Ošetření winstreaku (pokud API nevrací, aby to nebylo undefined)
            const ws = duels.winstreak !== undefined ? duels.winstreak : "?";
            const bestWs = duels.bestwinstreak !== undefined ? duels.bestwinstreak : "?";

            let mcMessage = `**Duels**: **${api.username}** - ${uhg.f(duels.wins)}Wins ${duels.wlr}WLR ${uhg.f(ws)}WS (Best: ${uhg.f(bestWs)})`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Duels - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(duels.wins)}\``, inline: true },
                    { name: "Losses", value: `\`${uhg.f(duels.losses)}\``, inline: true },
                    { name: "WLR", value: `\`${duels.wlr}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(duels.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(duels.deaths)}\``, inline: true },
                    { name: "KDR", value: `\`${duels.kdr}\``, inline: true },
                    { name: "Winstreak", value: `Current: \`${uhg.f(ws)}\`\nBest: \`${uhg.f(bestWs)}\``, inline: false },
                    { name: "Loot Chests", value: `\`${uhg.f(duels.lootchests)}\``, inline: true },
                    { name: "Coins", value: `\`${uhg.f(duels.coins)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Duels: `.red, e);
            return "Chyba při načítání Duels statistik.";
        }
    }
};
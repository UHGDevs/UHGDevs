module.exports = {
    name: "CaC",
    aliases: ["cac", "cvc", "copsandcrims", "cops"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const cac = api.hypixel.stats.cac;
            const overall = cac.overall;
            const defusal = cac.defusal;
            const dm = cac.deathmatch;

            // MC: Stručný přehled
            let mcMessage = `**CaC**: **${api.username}** - ${uhg.f(overall.wins)}Wins ${uhg.f(overall.kills)}Kills ${overall.kdr}KDR | ${uhg.f(defusal.bombsdefused)} Defused`;

            // DC: Detailní Embed
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Cops and Crims - ${uhg.dontFormat(api.username)}`)
                .setColor(0xFFAA00)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Coins:** \`${uhg.f(cac.coins)}\``)
                .addFields(
                    { name: "Overall", value: `Wins: \`${uhg.f(overall.wins)}\`\nKills: \`${uhg.f(overall.kills)}\`\nKDR: \`${overall.kdr}\`\nHeadshots: \`${uhg.f(overall.headshotkills)}\``, inline: true },
                    { name: "Defusal", value: `Wins: \`${uhg.f(defusal.wins)}\`\nKills: \`${uhg.f(defusal.kills)}\`\nBombs Planted: \`${uhg.f(defusal.bombsplanted)}\`\nBombs Defused: \`${uhg.f(defusal.bombsdefused)}\``, inline: true },
                    { name: "Deathmatch", value: `Wins: \`${uhg.f(dm.wins)}\`\nKills: \`${uhg.f(dm.kills)}\`\nKDR: \`${dm.kdr}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command CaC: `.red, e);
            return "Chyba při načítání Cops and Crims statistik.";
        }
    }
};
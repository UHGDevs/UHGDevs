module.exports = {
    name: "MurderMystery",
    aliases: ["mm", "murder", "murdermystery"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const murder = api.hypixel.stats.murder;
            const overall = murder.overall;

            let mcMessage = `**MurderMystery**: **${api.username}** - ${uhg.f(overall.wins)}Wins (M: ${uhg.f(murder.murdererwins)} D: ${uhg.f(murder.detectivewins)} H: ${uhg.f(murder.herowins)}) ${uhg.f(overall.kills)}Kills (Main: ${murder.main_mode})`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Murder Mystery - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Total Wins", value: `\`${uhg.f(overall.wins)}\``, inline: true },
                    { name: "Total Kills", value: `\`${uhg.f(overall.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${overall.kdr}\``, inline: true },
                    { name: "Wins Breakdown", value: `Murderer: \`${uhg.f(murder.murdererwins)}\`\nDetective: \`${uhg.f(murder.detectivewins)}\`\nHero: \`${uhg.f(murder.herowins)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command MurderMystery: `.red, e);
            return "Chyba při načítání Murder Mystery statistik.";
        }
    }
};
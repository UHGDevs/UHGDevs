module.exports = {
    name: "HITW",
    aliases: ["hitw", "holeinthewall"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const hitw = api.hypixel.stats.arcade.holeinthewall;

            let mcMessage = `**HITW**: **${api.username}** - ${uhg.f(hitw.wins)}Wins ${hitw.rounds} Rounds, ${uhg.f(hitw.qscore)} Qualification Score, ${uhg.f(hitw.fscore)} Final Score`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Hole in the Wall - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(hitw.wins)}\``, inline: true },
                    { name: "Rounds", value: `\`${uhg.f(hitw.rounds)}\``, inline: true },
                    { name: "Scores", value: `Qual: \`${uhg.f(hitw.qscore)}\`\nFinal: \`${uhg.f(hitw.fscore)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command HITW: `.red, e);
            return "Chyba při načítání HITW statistik.";
        }
    }
};
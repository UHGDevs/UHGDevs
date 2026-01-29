module.exports = {
    name: "PartyGames",
    aliases: ["partygames", "pg"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const pg = api.hypixel.stats.arcade.partygames;

            let mcMessage = `**PartyGames**: **${api.username}** - ${uhg.f(pg.wins)}Wins ${uhg.f(pg.stars)}☆ ${uhg.f(pg.rounds)} Rounds`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Party Games - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(pg.wins)}\``, inline: true },
                    { name: "Stars", value: `\`${uhg.f(pg.stars)}\`☆`, inline: true },
                    { name: "Round Wins", value: `\`${uhg.f(pg.rounds)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command PartyGames: `.red, e);
            return "Chyba při načítání Party Games statistik.";
        }
    }
};
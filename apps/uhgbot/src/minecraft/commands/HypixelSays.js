module.exports = {
    name: "HypixelSays",
    aliases: ["hypixelsays", "simonsays", "santasays", "simon"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            // Data jsou v arcade -> hypixelsays -> overall
            const simon = api.hypixel.stats.arcade.hypixelsays.overall;

            let mcMessage = `**HypixelSays**: **${api.username}** - ${uhg.f(simon.wins)}Wins ${uhg.f(simon.totalpoints)} Points`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Hypixel Says - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(simon.wins)}\``, inline: true },
                    { name: "Points", value: `\`${uhg.f(simon.totalpoints)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command HypixelSays: `.red, e);
            return "Chyba při načítání Hypixel Says statistik.";
        }
    }
};
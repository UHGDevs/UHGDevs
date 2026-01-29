module.exports = {
    name: "GalaxyWars",
    aliases: ["galaxywars", "galaxy", "gw", "starwars"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const gw = api.hypixel.stats.arcade.galaxywars;

            let mcMessage = `**GalaxyWars**: **${api.username}** - ${uhg.f(gw.wins)}Wins ${uhg.f(gw.kills)}Kills ${uhg.f(gw.kdr)}KDR`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Galaxy Wars - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(gw.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(gw.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${gw.kdr}\``, inline: true },
                    { name: "Rebel Kills", value: `\`${uhg.f(gw.rebelkills)}\``, inline: true },
                    { name: "Empire Kills", value: `\`${uhg.f(gw.empirekills)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command GalaxyWars: `.red, e);
            return "Chyba při načítání Galaxy Wars statistik.";
        }
    }
};
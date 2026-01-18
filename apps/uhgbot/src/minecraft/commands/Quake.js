module.exports = {
    name: "Quake",
    aliases: ["quakecraft", "quake", "qc"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const quake = api.hypixel.stats.quake;

            let mcMessage = `**Quake**: **${api.username}** - ${uhg.f(quake.wins)}Wins ${uhg.f(quake.kills)}Kills ${quake.kdr}KDR`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Quakecraft - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(quake.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(quake.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${quake.kdr}\``, inline: true },
                    { name: "Headshots", value: `\`${uhg.f(quake.headshots)}\``, inline: true },
                    { name: "Best Killstreak", value: `\`${uhg.f(quake.bestkillstreak)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Quake: `.red, e);
            return "Chyba při načítání Quake statistik.";
        }
    }
};
module.exports = {
    name: "Paintball",
    aliases: ["paint", "paintball", "pb"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const pb = api.hypixel.stats.paintball;

            // Využití helperu pro zkrácené číslo (14500 -> 14.5k) pokud ho nemáš v uhg.r, použij uhg.f
            const killsFormatted = uhg.r ? uhg.r(pb.kills) : uhg.f(pb.kills);

            let mcMessage = `**Paintball**: [${killsFormatted}] **${api.username}** - ${uhg.f(pb.wins)} Wins ${uhg.f(pb.kills)} Kills ${pb.kdr} KDR`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Paintball - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(pb.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(pb.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${pb.kdr}\``, inline: true },
                    { name: "Killstreaks", value: `\`${uhg.f(pb.killstreaks)}\``, inline: true },
                    { name: "Shots Fired", value: `\`${uhg.f(pb.shots)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Paintball: `.red, e);
            return "Chyba při načítání Paintball statistik.";
        }
    }
};
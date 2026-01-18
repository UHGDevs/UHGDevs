module.exports = {
    name: "Warlords",
    aliases: ["warlords", "warlord"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const w = api.hypixel.stats.warlords;

            let mcMessage = `**Warlords**: **${api.username}** - ${uhg.f(w.wins)}Wins ${uhg.f(w.kills)}Kills ${w.kdr}KDR ${uhg.f(w.assists)}Assists`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Warlords - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(w.wins)}\``, inline: true },
                    { name: "Losses", value: `\`${uhg.f(w.losses)}\``, inline: true },
                    { name: "WLR", value: `\`${w.wlr}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(w.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(w.deaths)}\``, inline: true },
                    { name: "KDR", value: `\`${w.kdr}\``, inline: true },
                    { name: "Objectives", value: `Assists: \`${uhg.f(w.assists)}\`\nFlags Captured: \`${uhg.f(w.flagcaptures)}\`\nFlags Returned: \`${uhg.f(w.flagreturns)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Warlords: `.red, e);
            return "Chyba při načítání Warlords statistik.";
        }
    }
};
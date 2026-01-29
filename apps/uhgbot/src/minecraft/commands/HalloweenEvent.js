module.exports = {
    name: "HalloweenEvent",
    aliases: ["halloween", "halloweenevent"],
    run: async (uhg, pmsg) => {
        try {
            let args = pmsg.args.split(" ");
            let year = new Date().getFullYear().toString();
            let nickname = pmsg.username;

            if (args[0] && args[0].length === 4 && !isNaN(args[0])) {
                year = args[0];
                nickname = args[1] || pmsg.username;
            } else if (args[1] && args[1].length === 4 && !isNaN(args[1])) {
                year = args[1];
                nickname = args[0];
            }

            const api = await uhg.api.call(nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const events = api.hypixel.stats.general.seasonal.events.halloween || {};

            if (!events[year]) {
                return `Hráč **${api.username}** nehrál v roce ${year} Halloween event.`;
            }

            const data = events[year];
            
            let mcMessage = `**${year} HalloweenEvent**: **${api.username}** - Level ${Math.floor(data.level)} | ${uhg.f(data.xpleft)} XP do dalšího Levelu | ${uhg.f(api.hypixel.stats.general.seasonal.silver)} Silver`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Halloween Event ${year} - ${uhg.dontFormat(api.username)}`)
                .setColor(0xFFAA00)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Level", value: `\`${Math.floor(data.level)}\``, inline: true },
                    { name: "XP do levelu", value: `\`${uhg.f(data.xpleft)}\``, inline: true },
                    { name: "Total Silver", value: `\`${uhg.f(api.hypixel.stats.general.seasonal.silver)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Halloween: `.red, e);
            return "Chyba při načítání Halloween statistik.";
        }
    }
};
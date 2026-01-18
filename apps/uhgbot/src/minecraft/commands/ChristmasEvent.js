module.exports = {
    name: "ChristmasEvent",
    aliases: ["christmas", "christmasevent", "xmas", "xmasevent"],
    run: async (uhg, pmsg) => {
        try {
            // Stejná logika argumentů jako Easter
            let args = pmsg.args.split(" ");
            let year = new Date().getFullYear().toString();
            let nickname = pmsg.nickname;

            if (args[0] && args[0].length === 4 && !isNaN(args[0])) {
                year = args[0];
                nickname = args[1] || pmsg.username;
            } else if (args[1] && args[1].length === 4 && !isNaN(args[1])) {
                year = args[1];
                nickname = args[0];
            }

            const api = await uhg.api.call(nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const events = api.hypixel.seasonal.events.christmas || {};
            
            if (!events[year]) {
                return `Hráč **${api.username}** nehrál v roce ${year} Christmas event.`;
            }

            const data = events[year];
            
            let mcMessage = `**${year} ChristmasEvent**: **${api.username}** - Level ${Math.floor(data.level)} | ${uhg.f(data.xpleft)} XP do dalšího Levelu | ${uhg.f(api.hypixel.seasonal.silver)} Silver`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Christmas Event ${year} - ${uhg.dontFormat(api.username)}`)
                .setColor(0xFF0000) // Červená pro Vánoce
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Level", value: `\`${Math.floor(data.level)}\``, inline: true },
                    { name: "XP do levelu", value: `\`${uhg.f(data.xpleft)}\``, inline: true },
                    { name: "Total Silver", value: `\`${uhg.f(api.hypixel.seasonal.silver)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Christmas: `.red, e);
            return "Chyba při načítání Christmas Event statistik.";
        }
    }
};
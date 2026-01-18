module.exports = {
    name: "EasterEvent",
    aliases: ["easter"],
    run: async (uhg, pmsg) => {
        try {
            // Logika argumentů (Nick vs Rok)
            let args = pmsg.args.split(" ");
            let year = new Date().getFullYear().toString();
            let nickname = pmsg.nickname;

            // Pokud první argument je rok (4 čísla)
            if (args[0] && args[0].length === 4 && !isNaN(args[0])) {
                year = args[0];
                nickname = args[1] || pmsg.username;
            } 
            // Pokud druhý argument je rok
            else if (args[1] && args[1].length === 4 && !isNaN(args[1])) {
                year = args[1];
                nickname = args[0];
            }

            const api = await uhg.api.call(nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const events = api.hypixel.seasonal.events.easter || {};
            
            if (!events[year]) {
                return `Hráč **${api.username}** nehrál v roce ${year} Easter event.`;
            }

            const data = events[year];
            
            let mcMessage = `**${year} EasterEvent**: **${api.username}** - Level ${Math.floor(data.level)} | ${uhg.f(data.xpleft)} XP do dalšího Levelu | ${uhg.f(api.hypixel.seasonal.silver)} Silver`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Easter Event ${year} - ${uhg.dontFormat(api.username)}`)
                .setColor(0xFFAA00)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Level", value: `\`${Math.floor(data.level)}\``, inline: true },
                    { name: "XP do levelu", value: `\`${uhg.f(data.xpleft)}\``, inline: true },
                    { name: "Total Silver", value: `\`${uhg.f(api.hypixel.seasonal.silver)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Easter: `.red, e);
            return "Chyba při načítání Easter Event statistik.";
        }
    }
};
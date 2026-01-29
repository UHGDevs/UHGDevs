module.exports = {
    name: "Blitz",
    aliases: ["blitz", "blitzsg", "sg", "bsg", "blitzsurvivalgames", "blits"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const sg = api.hypixel.stats.blitz;
            const playtimeHours = Math.floor((sg.playtime || 0) / 3600); // Předpoklad: playtime je v sekundách

            // MC: Zachován formát
            let mcMessage = `**Blitz**: [${uhg.f(sg.kills)}] **${api.username}** - ${uhg.f(sg.wins)}Wins ${uhg.f(sg.kdr)}KDR | Playtime: ${playtimeHours}h | Default Kit: ${sg.defaultkit}`;

            // DC: Rozšířené
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Blitz SG - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Kills", value: `\`${uhg.f(sg.kills)}\``, inline: true },
                    { name: "Wins", value: `\`${uhg.f(sg.wins)}\``, inline: true },
                    { name: "KDR", value: `\`${sg.kdr}\``, inline: true },
                    { name: "Kit", value: `${sg.defaultkit}`, inline: true },
                    { name: "Playtime", value: `${playtimeHours} hours`, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Blitz: `.red, e);
            return "Chyba při načítání Blitz SG statistik.";
        }
    }
};
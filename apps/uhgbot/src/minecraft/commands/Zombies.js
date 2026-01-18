module.exports = {
    name: "Zombies",
    aliases: ["zombies", "zombie"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const zombies = api.hypixel.stats.arcade.zombies;

            // Formátování koncovky kola (1st, 2nd, 3rd, 4th...)
            let bestround = zombies.bestround;
            let suffix = "th";
            if (bestround % 10 === 1 && bestround !== 11) suffix = "st";
            else if (bestround % 10 === 2 && bestround !== 12) suffix = "nd";
            else if (bestround % 10 === 3 && bestround !== 13) suffix = "rd";

            let mcMessage = `**Zombies**: **${api.username}** - ${uhg.f(zombies.wins)}Wins ${uhg.f(zombies.kills)}Kills ${zombies.kdr}KDR ${zombies.misshitratio} Miss/Hit (Best: ${bestround}${suffix} Wave)`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Zombies - ${uhg.dontFormat(api.username)}`)
                .setColor(0x00AA00) // Dark Green
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(zombies.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(zombies.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${zombies.kdr}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(zombies.deaths)}\``, inline: true },
                    { name: "Best Round", value: `\`${bestround}\``, inline: true },
                    { name: "Accuracy", value: `Ratio: \`${zombies.misshitratio}\`\nHeadshots: \`${uhg.f(zombies.headshots)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Zombies: `.red, e);
            return "Chyba při načítání Zombies statistik.";
        }
    }
};
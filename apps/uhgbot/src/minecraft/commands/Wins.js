module.exports = {
    name: "Wins",
    aliases: ["wins", "win", "výhry", "totalwins"],
    run: async (uhg, pmsg) => {
        try {
            return "Příkaz wins momentálně nefunguje"
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const wins = api.hypixel.stats.wins;
            if (!wins || !wins.minigames) return `Hráč **${api.username}** nemá žádné výhry.`;

            // Seřazení her podle počtu výher
            const sortedGames = Object.entries(wins.minigames)
                .sort((a, b) => b[1] - a[1]);

            // Příprava TOP 3 pro Minecraft
            const top3 = sortedGames.slice(0, 3).map((g, i) => {
                const suffix = i === 0 ? "st" : i === 1 ? "nd" : "rd";
                return `${i+1}${suffix}: ${g[0]} - ${uhg.f(g[1])}`;
            }).join("; ");

            let mcMessage = `**${api.username}** - ${uhg.f(wins.total)} Wins (${top3})`;

            // Příprava Embedu (TOP 10)
            let desc = "";
            sortedGames.slice(0, 10).forEach((g, i) => {
                let icon = `\`#${i+1}\``;
                if (i===0) icon="🥇"; if(i===1) icon="🥈"; if(i===2) icon="🥉";
                desc += `${icon} **${g[0]}:** \`${uhg.f(g[1])}\`\n`;
            });

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Total Wins - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Total Wins:** \`${uhg.f(wins.total)}\`\n\n${desc}`);

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Wins: `.red, e);
            return "Chyba při načítání celkových výher.";
        }
    }
};
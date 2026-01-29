module.exports = {
    name: "BuildBattle",
    aliases: ["bb", "build", "buildbattle"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const bb = api.hypixel.stats.bb;

            // MC: Zachován formát
            let mcMessage = `**BuildBattle**: ${bb.title} **${api.username}** - ${uhg.f(bb.overall.wins)} Wins ${uhg.f(bb.score)} Score`;

            // DC: Rozšířené
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Build Battle - ${uhg.dontFormat(api.username)}`)
                .setColor(0x086405) // Zelená (zachována z původního kódu)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Title:** ${bb.title}\n**Score:** \`${uhg.f(bb.score)}\``)
                .addFields(
                    { name: "Overall Wins", value: `\`${uhg.f(bb.overall.wins)}\``, inline: true },
                    { name: "Pro Wins", value: `\`${uhg.f(bb.pro.wins)}\``, inline: true },
                    { name: "Guess the Build Wins", value: `\`${uhg.f(bb.guess.wins)}\``, inline: true },
                    { name: "Coins", value: `\`${uhg.f(bb.coins)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command BuildBattle: `.red, e);
            return "Chyba při načítání Build Battle statistik.";
        }
    }
};
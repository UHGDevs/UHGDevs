module.exports = {
    name: "UHC",
    aliases: ["uhc", "ultrahardcore", "hypixeluhc"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const uhc = api.hypixel.stats.uhc;

            let mcMessage = `**UHC**: [${uhc.level}✫] **${api.username}** - ${uhg.f(uhc.wins)}Wins ${uhg.f(uhc.kills)}Kills ${uhc.kdr}KDR (${uhg.f(uhc.score)} Score)`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`UHC Champions - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Level:** ${uhc.level}✫\n**Score:** \`${uhg.f(uhc.score)}\``)
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(uhc.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(uhc.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(uhc.deaths)}\``, inline: true },
                    { name: "Ratios", value: `KDR: \`${uhc.kdr}\``, inline: true },
                    { name: "Crafting", value: `Ultimates: \`${uhg.f(uhc.ultimates)}\`\nExtra Ult: \`${uhg.f(uhc.extraultimates)}\``, inline: true },
                    { name: "Coins", value: `\`${uhg.f(uhc.coins)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command UHC: `.red, e);
            return "Chyba při načítání UHC statistik.";
        }
    }
};
module.exports = {
    name: "Football",
    aliases: ["football", "fb", "soccer"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const fb = api.hypixel.stats.arcade.football;

            let mcMessage = `**Football**: **${api.username}** - ${uhg.f(fb.wins)}Wins ${uhg.f(fb.goals)} Goals`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Football - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(fb.wins)}\``, inline: true },
                    { name: "Goals", value: `\`${uhg.f(fb.goals)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Football: `.red, e);
            return "Chyba při načítání Football statistik.";
        }
    }
};
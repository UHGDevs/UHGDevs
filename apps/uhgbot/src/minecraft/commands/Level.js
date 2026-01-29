module.exports = {
    name: "Level",
    aliases: ["level", "lvl", "karma"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const hypixel = api.hypixel.stats.general;

            let mcMessage = `**${api.username}** - Level ${uhg.f(hypixel.level)} | ${uhg.f(hypixel.karma)} Karma`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Network Stats - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Network Level", value: `\`${uhg.f(hypixel.level)}\``, inline: true },
                    { name: "Karma", value: `\`${uhg.f(hypixel.karma)}\``, inline: true },
                    { name: "Achievement Points", value: `\`${uhg.f(hypixel.aps)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Level: `.red, e);
            return "Chyba při načítání Levelu/Karmy.";
        }
    }
};
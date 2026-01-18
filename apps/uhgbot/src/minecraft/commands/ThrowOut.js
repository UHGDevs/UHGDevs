module.exports = {
    name: "ThrowOut",
    aliases: ["throwout"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const to = api.hypixel.stats.arcade.throwout;

            let mcMessage = `**ThrowOut**: **${api.username}** - ${uhg.f(to.wins)}Wins ${uhg.f(to.kills)}Kills ${to.kdr}KDR`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Throw Out - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(to.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(to.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(to.deaths)}\``, inline: true },
                    { name: "KDR", value: `\`${to.kdr}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command ThrowOut: `.red, e);
            return "Chyba při načítání Throw Out statistik.";
        }
    }
};
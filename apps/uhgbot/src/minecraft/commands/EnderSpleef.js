module.exports = {
    name: "EnderSpleef",
    aliases: ["enderspleef", "ender", "es"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const ender = api.hypixel.stats.arcade.enderspleef;

            let mcMessage = `**EnderSpleef**: **${api.username}** - ${uhg.f(ender.wins)}Wins - Trail: ${ender.trail}`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Ender Spleef - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(ender.wins)}\``, inline: true },
                    { name: "Trail", value: `${ender.trail}`, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command EnderSpleef: `.red, e);
            return "Chyba při načítání Ender Spleef statistik.";
        }
    }
};
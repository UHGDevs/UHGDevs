module.exports = {
    name: "Blockingdead",
    aliases: ["blockingdead", "bd"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            // Data jsou vnořená v arcade parseru
            const bd = api.hypixel.stats.arcade.blockingdead;

            let mcMessage = `**BlockingDead**: **${api.username}** - ${uhg.f(bd.wins)}Wins ${uhg.f(bd.kills)}Kills ${uhg.f(bd.headshots)}Headshots`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Blocking Dead - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(bd.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(bd.kills)}\``, inline: true },
                    { name: "Headshots", value: `\`${uhg.f(bd.headshots)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Blockingdead: `.red, e);
            return "Chyba při načítání Blocking Dead statistik.";
        }
    }
};
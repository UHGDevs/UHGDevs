module.exports = {
    name: "MiniWalls",
    aliases: ["miniwalls", "miniw"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const mw = api.hypixel.stats.arcade.miniwalls;

            let mcMessage = `**MiniWalls**: **${api.username}** - ${uhg.f(mw.wins)}Wins ${uhg.f(mw.kills)}Kills ${uhg.f(mw.kdr)}KDR (Withers: ${uhg.f(mw.witherkills)}Kills ${uhg.f(mw.witherdmg)} Dmg) Kit: ${mw.kit}`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Mini Walls - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(mw.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(mw.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${mw.kdr}\``, inline: true },
                    { name: "Finals", value: `\`${uhg.f(mw.finals)}\``, inline: true },
                    { name: "Wither Damage", value: `\`${uhg.f(mw.witherdmg)}\``, inline: true },
                    { name: "Active Kit", value: `${mw.kit}`, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command MiniWalls: `.red, e);
            return "Chyba při načítání Mini Walls statistik.";
        }
    }
};
module.exports = {
    name: "MegaWalls",
    aliases: ["megawalls", "megaw", "mw"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const mw = api.hypixel.stats.megawalls;
            const playtimeHours = Math.floor((mw.playtime || 0) / 60);

            let mcMessage = `**MegaWalls**: **${api.username}** - ${uhg.f(mw.wins)}Wins ${uhg.f(mw.kills)}Kills ${uhg.f(mw.fk)}FK ${uhg.f(mw.fkdr)}FKDR ${uhg.f(mw.wlr)}WLR | Playtime: ${playtimeHours}h | Class: ${mw.class}`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Mega Walls - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(mw.wins)}\``, inline: true },
                    { name: "Final Kills", value: `\`${uhg.f(mw.fk)}\``, inline: true },
                    { name: "FKDR", value: `\`${mw.fkdr}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(mw.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(mw.deaths)}\``, inline: true },
                    { name: "WLR", value: `\`${mw.wlr}\``, inline: true },
                    { name: "Class", value: `${mw.class}`, inline: true },
                    { name: "Wither DMG", value: `\`${uhg.f(mw.witherdmg)}\``, inline: true },
                    { name: "Playtime", value: `${playtimeHours}h`, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command MegaWalls: `.red, e);
            return "Chyba při načítání Mega Walls statistik.";
        }
    }
};
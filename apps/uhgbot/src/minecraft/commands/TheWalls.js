module.exports = {
    name: "TheWalls",
    aliases: ["thewalls", "walls"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const walls = api.hypixel.stats.thewalls;

            let mcMessage = `**TheWalls**: [${uhg.f(walls.wins)}] **${api.username}** - ${uhg.f(walls.kills)}Kills ${walls.kdr}KDR ${walls.wlr}WLR`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`The Walls - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(walls.wins)}\``, inline: true },
                    { name: "Losses", value: `\`${uhg.f(walls.losses)}\``, inline: true },
                    { name: "WLR", value: `\`${walls.wlr}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(walls.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(walls.deaths)}\``, inline: true },
                    { name: "KDR", value: `\`${walls.kdr}\``, inline: true },
                    { name: "Assists", value: `\`${uhg.f(walls.assists)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command TheWalls: `.red, e);
            return "Chyba při načítání The Walls statistik.";
        }
    }
};
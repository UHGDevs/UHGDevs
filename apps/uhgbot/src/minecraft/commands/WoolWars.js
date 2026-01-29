module.exports = {
    name: "WoolWars",
    aliases: ["ww", "wool", "wools", "woolwars"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const ww = api.hypixel.stats.ww;
            const mainClass = ww.main_class ? ww.main_class[0] : "None";

            let mcMessage = `**WoolWars**: [${Math.floor(ww.levelformatted)}✫] **${api.username}** - ${uhg.f(ww.wins)}Wins ${uhg.f(ww.kills)}Kills ${ww.wlr}WLR ${ww.kdr}KDR (${uhg.f(Math.round(ww.levelxpleft))} XP to next level) | (Main: ${mainClass})`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Wool Wars - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Level:** ${Math.floor(ww.levelformatted)}✫\n**Main Class:** ${mainClass}`)
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(ww.wins)}\``, inline: true },
                    { name: "Losses", value: `\`${uhg.f(ww.losses)}\``, inline: true },
                    { name: "WLR", value: `\`${ww.wlr}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(ww.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(ww.deaths)}\``, inline: true },
                    { name: "KDR", value: `\`${ww.kdr}\``, inline: true },
                    { name: "Stats", value: `Blocks Broken: \`${uhg.f(ww.blocks_broken)}\`\nWool Placed: \`${uhg.f(ww.blocks_placed)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command WoolWars: `.red, e);
            return "Chyba při načítání Wool Wars statistik.";
        }
    }
};
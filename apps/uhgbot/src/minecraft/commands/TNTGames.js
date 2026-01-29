module.exports = {
    name: "TNTGames",
    aliases: ["tntgames", "tnt", "tnts", "tntgame", "wizard", "wizards", "tntrun", "pvprun", "tnttag", "bowspleef"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const tnt = api.hypixel.stats.tntgames;
            const overall = tnt.overall;
            
            // Playtime buď z parseru, nebo 0
            const playtimeHours = Math.floor((tnt.playtime || 0) / 60);

            let mcMessage = `**TNTGames**: **${api.username}** - ${uhg.f(overall.wins)}Wins ${uhg.f(overall.kills)}Kills ${overall.kdr}KDR (Playtime: ${playtimeHours}h)`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`TNT Games - ${uhg.dontFormat(api.username)}`)
                .setColor(0xFF5555) // Červená pro TNT
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Coins:** \`${uhg.f(tnt.coins)}\`\n**Winstreak:** \`${uhg.f(tnt.winstreak)}\``)
                .addFields(
                    { name: "Overall", value: `Wins: \`${uhg.f(overall.wins)}\`\nKills: \`${uhg.f(overall.kills)}\`\nKDR: \`${overall.kdr}\``, inline: true },
                    { name: "TNT Run", value: `Wins: \`${uhg.f(tnt.tntrun.wins)}\`\nRecord: \`${tnt.tntrun.record}\``, inline: true },
                    { name: "PVP Run", value: `Wins: \`${uhg.f(tnt.pvprun.wins)}\`\nKills: \`${uhg.f(tnt.pvprun.kills)}\`\nRecord: \`${tnt.pvprun.record}\``, inline: true },
                    { name: "Wizards", value: `Wins: \`${uhg.f(tnt.wizards.wins)}\`\nKills: \`${uhg.f(tnt.wizards.kills)}\``, inline: true },
                    { name: "TNT Tag", value: `Wins: \`${uhg.f(tnt.tnttag.wins)}\`\nKills: \`${uhg.f(tnt.tnttag.kills)}\``, inline: true },
                    { name: "Bow Spleef", value: `Wins: \`${uhg.f(tnt.bowspleef.wins)}\`\nShots: \`${uhg.f(tnt.bowspleef.shots)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command TNTGames: `.red, e);
            return "Chyba při načítání TNT Games statistik.";
        }
    }
};
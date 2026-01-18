module.exports = {
    name: "SpeedUHC",
    aliases: ["speeduhc", "speedultrahardcore", "suhc"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const suhc = api.hypixel.stats.speeduhc;

            // MC: Zachován formát
            let mcMessage = `**SpeedUHC**: [${suhc.level}✫] ${api.username} - ${uhg.f(suhc.wins)}Wins ${uhg.f(suhc.kills)}Kills ${suhc.wlr}WLR ${suhc.kdr}KDR (${uhg.f(suhc.score)} Score)`;

            // DC: Rozšířené
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Speed UHC - ${uhg.dontFormat(api.username)}`)
                .setColor(0x00AAAA) // Dark Aqua
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(`**Level:** ${suhc.level}✫\n**Score:** \`${uhg.f(suhc.score)}\`\n**Mastery:** ${suhc.masterperk}`)
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(suhc.wins)}\``, inline: true },
                    { name: "Losses", value: `\`${uhg.f(suhc.losses)}\``, inline: true },
                    { name: "WLR", value: `\`${suhc.wlr}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(suhc.kills)}\``, inline: true },
                    { name: "Deaths", value: `\`${uhg.f(suhc.deaths)}\``, inline: true },
                    { name: "KDR", value: `\`${suhc.kdr}\``, inline: true },
                    { name: "Streaks", value: `Killstreak: \`${uhg.f(suhc.killstreak)}\` (Best: ${uhg.f(suhc.highestkillstreak)})\nWinstreak: \`${uhg.f(suhc.winstreak)}\` (Best: ${uhg.f(suhc.highestwinstreak)})`, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command SpeedUHC: `.red, e);
            return "Chyba při načítání Speed UHC statistik.";
        }
    }
};
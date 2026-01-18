module.exports = {
    name: "BountyHunters",
    aliases: ["bountyhunters", "bounty", "bh"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const bh = api.hypixel.stats.arcade.bountyhunters;

            let mcMessage = `**BountyHunters**: **${api.username}** - ${uhg.f(bh.wins)}Wins ${uhg.f(bh.kills)}Kills ${bh.kdr}KDR ${uhg.f(bh.bountykills)} Bounty Kills`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Bounty Hunters - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(bh.wins)}\``, inline: true },
                    { name: "Kills", value: `\`${uhg.f(bh.kills)}\``, inline: true },
                    { name: "KDR", value: `\`${bh.kdr}\``, inline: true },
                    { name: "Bounty Kills", value: `\`${uhg.f(bh.bountykills)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command BountyHunters: `.red, e);
            return "Chyba při načítání Bounty Hunters statistik.";
        }
    }
};
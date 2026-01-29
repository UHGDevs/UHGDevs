module.exports = {
    name: "PixelParty",
    aliases: ["pixelparty", "pp", "pixel"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const pp = api.hypixel.stats.arcade.pixelparty;

            let mcMessage = `**PixelParty**: **${api.username}** - ${uhg.f(pp.wins)}Wins ${uhg.f(pp.wlr)}WLR | ${uhg.f(pp.rounds)} Rounds (High: ${pp.highestround}) | ${uhg.f(pp.powerups)} Powerups`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Pixel Party - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(pp.wins)}\``, inline: true },
                    { name: "Losses", value: `\`${uhg.f(pp.losses)}\``, inline: true },
                    { name: "WLR", value: `\`${pp.wlr}\``, inline: true },
                    { name: "Highest Round", value: `\`${pp.highestround}\``, inline: true },
                    { name: "Powerups", value: `\`${uhg.f(pp.powerups)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command PixelParty: `.red, e);
            return "Chyba při načítání Pixel Party statistik.";
        }
    }
};
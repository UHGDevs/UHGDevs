module.exports = {
    name: "PixelPainters",
    aliases: ["pixelpainters", "painters"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const pp = api.hypixel.stats.arcade.pixelpainters;

            let mcMessage = `**PixelPainters**: **${api.username}** - ${uhg.f(pp.wins)}Wins`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Pixel Painters - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(pp.wins)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command PixelPainters: `.red, e);
            return "Chyba při načítání Pixel Painters statistik.";
        }
    }
};
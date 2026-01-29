module.exports = {
    name: "CaptureTheWool",
    aliases: ["capturethewool", "ctw"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            // CTW bývá v arcade objektu
            const ctw = api.hypixel.stats.arcade.capturethewool;

            let mcMessage = `**CTW**: **${api.username}** - ${uhg.f(ctw.killsassists)} Kills+Assists | ${uhg.f(ctw.capturedwools)} Wools Captured`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Capture The Wool - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Kills + Assists", value: `\`${uhg.f(ctw.killsassists)}\``, inline: true },
                    { name: "Wools Captured", value: `\`${uhg.f(ctw.capturedwools)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command CTW: `.red, e);
            return "Chyba při načítání CTW statistik.";
        }
    }
};
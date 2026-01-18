module.exports = {
    name: "TKR",
    aliases: ["tkr", "turbokartracers"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const tkr = api.hypixel.stats.tkr;

            let mcMessage = `**TKR**: [${uhg.f(tkr.gold)}✪] **${api.username}** - ${uhg.f(tkr.trophies)} Trophies (G:${uhg.f(tkr.gold)}, S:${uhg.f(tkr.silver)}, B:${uhg.f(tkr.bronze)}) ${uhg.f(tkr.wlr)}WLR`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Turbo Kart Racers - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Trophies", value: `Total: \`${uhg.f(tkr.trophies)}\`\nRatio: \`${uhg.f(tkr.trophyratio)}\``, inline: true },
                    { name: "Medals", value: `Gold: \`${uhg.f(tkr.gold)}\`\nSilver: \`${uhg.f(tkr.silver)}\`\nBronze: \`${uhg.f(tkr.bronze)}\``, inline: true },
                    { name: "Stats", value: `WLR: \`${uhg.f(tkr.wlr)}\`\nLaps: \`${uhg.f(tkr.laps)}\``, inline: true },
                    { name: "Records", value: `Coins: \`${uhg.f(tkr.coins)}\`\nBoxes: \`${uhg.f(tkr.collectedboxes)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command TKR: `.red, e);
            return "Chyba při načítání TKR statistik.";
        }
    }
};
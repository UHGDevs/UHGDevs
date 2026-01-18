module.exports = {
    name: "HideAndSeek",
    aliases: ["hideandseek", "has", "hns", "hidenseek", "prophunt", "partypopper"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const hns = api.hypixel.stats.arcade.hideandseek;
            const overall = hns.overall;
            const pp = hns.partypopper;
            const ph = hns.prophunt;

            let mcMessage = `**HideAndSeek**: **${api.username}** - ${uhg.f(overall.wins)}Wins (Party Pooper: ${uhg.f(pp.hiderwins)}H ${uhg.f(pp.seekerwins)}S, Prop Hunt: ${uhg.f(ph.hiderwins)}H ${uhg.f(ph.seekerwins)}S)`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Hide and Seek - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Party Pooper", value: `Seeker Wins: \`${uhg.f(pp.seekerwins)}\`\nHider Wins: \`${uhg.f(pp.hiderwins)}\``, inline: true },
                    { name: "Prop Hunt", value: `Seeker Wins: \`${uhg.f(ph.seekerwins)}\`\nHider Wins: \`${uhg.f(ph.hiderwins)}\``, inline: true },
                    { name: "Overall", value: `Total Wins: \`${uhg.f(overall.wins)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command HideAndSeek: `.red, e);
            return "Chyba při načítání HnS statistik.";
        }
    }
};
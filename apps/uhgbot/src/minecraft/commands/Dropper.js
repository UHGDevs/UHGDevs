module.exports = {
    name: "Dropper",
    aliases: ["dropper"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const d = api.hypixel.stats.arcade.dropper;
            
            // Čas v DB bývá v ms, převedeme na sekundy pro hezký výpis
            const bestTimeSeconds = (d.fastest_game || 0) / 1000;

            let mcMessage = `**Dropper**: **${api.username}** - ${uhg.f(d.wins)} Wins | ${uhg.f(d.games_finished)} Finished | Best: ${bestTimeSeconds}s`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Dropper - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(d.wins)}\``, inline: true },
                    { name: "Games Finished", value: `\`${uhg.f(d.games_finished)}\``, inline: true },
                    { name: "Fastest Run", value: `\`${bestTimeSeconds}s\``, inline: true },
                    { name: "Fails", value: `\`${uhg.f(d.fails)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Dropper: `.red, e);
            return "Chyba při načítání Dropper statistik.";
        }
    }
};
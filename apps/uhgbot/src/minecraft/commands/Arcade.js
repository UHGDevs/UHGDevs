module.exports = {
    name: "Arcade",
    aliases: ["arcade", "arcades", "arcadegames", "arc"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;
            
            const arcade = api.hypixel.stats.arcade;
            
            // MC: Zachován původní formát
            let mcMessage = `**Arcade**: **${api.username}** - ${uhg.f(arcade.wins)}Wins`;
            
            // DC: Rozšířené info
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Arcade Games - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `\`${uhg.f(arcade.wins)}\``, inline: true },
                    { name: "Coins", value: `\`${uhg.f(arcade.coins)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Arcade: `.red, e);
            return "Chyba při načítání Arcade statistik.";
        }
    }
};
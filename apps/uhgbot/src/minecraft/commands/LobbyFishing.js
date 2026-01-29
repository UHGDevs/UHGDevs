module.exports = {
    name: "LobbyFishing",
    aliases: ["lf", "lobbyfishing", "mainlobbyfishing", "lobbyfish"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const fishing = api.hypixel.stats.general.fishing;

            let mcMessage = `Lobby Fishing: **${api.username}** - ${uhg.f(fishing.fish)} Fish, ${uhg.f(fishing.junk)} Junk, ${uhg.f(fishing.treasure)} Treasure`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Lobby Fishing - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Fish", value: `\`${uhg.f(fishing.fish)}\``, inline: true },
                    { name: "Treasure", value: `\`${uhg.f(fishing.treasure)}\``, inline: true },
                    { name: "Junk", value: `\`${uhg.f(fishing.junk)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command LobbyFishing: `.red, e);
            return "Chyba při načítání Fishing statistik.";
        }
    }
};
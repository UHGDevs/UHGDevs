module.exports = {
    name: "Status",
    aliases: ["status", "online", "onlinestatus", "o"],
    run: async (uhg, pmsg) => {
        try {
            // Voláme jen 'online' a 'mojang' pro jméno
            const api = await uhg.api.call(pmsg.nickname, ["online", "mojang"]);
            if (!api.success) return api.reason;

            const status = api.online;
            let mcMessage = "";
            let description = "";

            if (!status.online) {
                mcMessage = `[Offline] **${api.username}**`;
                description = "Hráč je momentálně **Offline**.";
            } else {
                const game = status.game || "Unknown";
                const mode = status.mode ? ` - ${status.mode}` : "";
                const map = status.map ? ` (${status.map})` : "";
                
                mcMessage = `[Online] **${api.username}** - ${game}${mode}${map}`;
                description = `Hráč je **Online**\n\n**Hra:** ${game}\n**Mód:** ${status.mode || "-"}\n**Mapa:** ${status.map || "-"}`;
            }

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Status - ${uhg.dontFormat(api.username)}`)
                .setColor(status.online ? 0x55FF55 : 0xFF5555) // Zelená / Červená
                .setThumbnail(uhg.getAvatar(api.uuid))
                .setDescription(description);

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Status: `.red, e);
            return "Chyba při zjišťování statusu.";
        }
    }
};
module.exports = {
    name: "Discord",
    aliases: ["discord", "social", "socials", "dc"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const links = api.hypixel.links || {};
            const discordTag = links.DISCORD;

            let msg = discordTag || "Nemá propojený Discord";

            let mcMessage = `**Discord**: **${api.username}** - ${msg}`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Discord - ${uhg.dontFormat(api.username)}`)
                .setColor(discordTag ? 0x55FF55 : 0xFF5555) // Zelená / Červená
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Linked Discord", value: `\`${msg}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Discord: `.red, e);
            return "Chyba při načítání sociálních sítí.";
        }
    }
};
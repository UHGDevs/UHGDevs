module.exports = {
    name: "CreeperAttack",
    aliases: ["creeperattack", "creeper"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            const creeper = api.hypixel.stats.arcade.creeperattack;

            let mcMessage = `**CreeperAttack**: **${api.username}** - Best Round: ${creeper.bestround}`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Creeper Attack - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Max Wave", value: `\`${uhg.f(creeper.bestround)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command CreeperAttack: `.red, e);
            return "Chyba při načítání Creeper Attack statistik.";
        }
    }
};
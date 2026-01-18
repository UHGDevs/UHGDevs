module.exports = {
    name: "Quests",
    aliases: ["quests", "quest", "challenge", "challenges"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.nickname, ["hypixel"]);
            if (!api.success) return api.reason;

            // Quests a Challenges jsou v rootu objektu (z general.js)
            const quests = api.hypixel.quests || 0;
            const challenges = api.hypixel.challenges || 0;

            let mcMessage = `**${api.username}** - ${uhg.f(quests)} Quests Completed | ${uhg.f(challenges)} Challenges Completed`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Quest Stats - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Quests", value: `\`${uhg.f(quests)}\``, inline: true },
                    { name: "Challenges", value: `\`${uhg.f(challenges)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Quests: `.red, e);
            return "Chyba při načítání Questů.";
        }
    }
};
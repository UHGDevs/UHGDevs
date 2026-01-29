module.exports = {
    name: "VampireZ",
    aliases: ["vz", "vampirez", "vampire"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const vz = api.hypixel.stats.vampirez;

            // MC: Specifický formát z původního bota
            let mcMessage = `**VampireZ**: [${uhg.f(vz.wins)}] **${api.username}** - Wins: ${uhg.f(vz.humanwins)}H ${uhg.f(vz.vampirewins)}V, Kills: ${uhg.f(vz.vampirekills)}V ${uhg.f(vz.humankills)}H ${uhg.f(vz.zombiekills)}Z`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`VampireZ - ${uhg.dontFormat(api.username)}`)
                .setColor(0xAA0000)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `Total: \`${uhg.f(vz.wins)}\`\nHuman: \`${uhg.f(vz.humanwins)}\`\nVampire: \`${uhg.f(vz.vampirewins)}\``, inline: true },
                    { name: "Kills", value: `Total: \`${uhg.f(vz.kills)}\`\nHuman: \`${uhg.f(vz.humankills)}\`\nVampire: \`${uhg.f(vz.vampirekills)}\`\nZombie: \`${uhg.f(vz.zombiekills)}\``, inline: true },
                    { name: "Other", value: `KDR: \`${vz.kdr}\`\nGold Bought: \`${uhg.f(vz.goldbought)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command VampireZ: `.red, e);
            return "Chyba při načítání VampireZ statistik.";
        }
    }
};
module.exports = {
    name: "FarmHunt",
    aliases: ["farmhunt", "farm", "fh"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const farm = api.hypixel.stats.arcade.farmhunt;

            let mcMessage = `**FarmHunt**: **${api.username}** - ${uhg.f(farm.wins)}Wins (${uhg.f(farm.animalwins)}A ${uhg.f(farm.hunterwins)}H), ${uhg.f(farm.kills)}Kills (${uhg.f(farm.animalkills)}A ${uhg.f(farm.hunterkills)}H)`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Farm Hunt - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Wins", value: `Total: \`${uhg.f(farm.wins)}\`\nAnimals: \`${uhg.f(farm.animalwins)}\`\nHunters: \`${uhg.f(farm.hunterwins)}\``, inline: true },
                    { name: "Kills", value: `Total: \`${uhg.f(farm.kills)}\`\nAnimals: \`${uhg.f(farm.animalkills)}\`\nHunters: \`${uhg.f(farm.hunterkills)}\``, inline: true },
                    { name: "Other", value: `Poop Collected: \`${uhg.f(farm.poop)}\``, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command FarmHunt: `.red, e);
            return "Chyba při načítání Farm Hunt statistik.";
        }
    }
};
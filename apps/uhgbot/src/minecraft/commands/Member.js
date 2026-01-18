module.exports = {
    name: "Member",
    aliases: ["member", "guild", "g"],
    run: async (uhg, pmsg) => {
        try {
            // Potřebujeme volat 'guild' endpoint
            const api = await uhg.api.call(pmsg.nickname, ["guild"]);
            if (!api.success) return api.reason;

            const guild = api.guild.guild;
            if (!guild) return `Hráč **${api.username}** není v žádné guildě.`;

            // Najdeme člena v seznamu guildy
            const member = api.guild.member;
            if (!member) return "Chyba při hledání člena v guildě.";

            const joined = member.joined;
            const grank = member.rank;
            const daysInGuild = Math.floor((Date.now() - joined) / 86400000);
            
            // ApiFunctions.getGuildLevel musí být dostupné
            const ApiFunctions = require('../../api/ApiFunctions');
            const gLevel = ApiFunctions.getGuildLevel(api.guild.all.exp);

            let mcMessage = `**${grank} ${api.username}** - [${Math.floor(gLevel)}] ${api.guild.name} - ${daysInGuild}d`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Guild Info - ${uhg.dontFormat(api.username)}`)
                .setColor(api.guild.color || 0x55FFFF) // Barva guild tagu
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Guild", value: `${api.guild.name} [${api.guild.tag}]`, inline: true },
                    { name: "Rank", value: `${grank}`, inline: true },
                    { name: "Level", value: `${Math.floor(gLevel)}`, inline: true },
                    { name: "Joined", value: `<t:${Math.round(joined/1000)}:R>`, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Member: `.red, e);
            return "Chyba při načítání Guild informací.";
        }
    }
};
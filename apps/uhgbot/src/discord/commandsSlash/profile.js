/**
 * src/discord/commandsSlash/profile.js
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: "profile",
    description: "Zobrazí profil hráče (Hypixel & UHG Stats)",
    options: [
        { name: "player", description: "Jméno hráče", type: 3, required: false },
        { name: "user", description: "Discord uživatel", type: 6, required: false }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        let playerArg = interaction.options.getString("player");
        let userArg = interaction.options.getUser("user");
        let targetIdentifier = playerArg;

        // --- LOGIKA IDENTIFIKACE ---
        if (!targetIdentifier) {
            // Pokud není zadáno jméno, zkusíme najít verifikaci (mentnutého uživatele nebo sebe)
            const discordId = userArg ? userArg.id : interaction.user.id;
            const verified = await uhg.db.getVerify(discordId);

            if (verified) {
                targetIdentifier = verified.uuid; // Použijeme UUID z DB
            } else {
                // Pokud uživatel není verifikovaný
                if (userArg) return interaction.editReply(`❌ Uživatel ${userArg} není verifikovaný a nebylo zadáno jméno.`);
                return interaction.editReply(`❌ Nejsi verifikovaný. Použij \`/verify [nick]\` nebo zadej jméno hráče.`);
            }
        }

        // 1. API CALL (předáme UUID nebo Jméno)
        let api = await uhg.api.call(targetIdentifier, ["hypixel", "guild", "online"]);
        if (!api.success) return interaction.editReply(`❌ Chyba API: ${api.reason}`);

        // 2. DB DATA (pro zjištění statusu a historie)
        const userInDb = await uhg.db.getUser(api.uuid);

        const hp = api.hypixel; 
        const gen = hp.stats.general;
        const guild = api.guild;

        const embed = new uhg.dc.Embed()
            .setTitle(`Profil: ${uhg.dontFormat(api.username)}`)
            .setURL(`https://plancke.io/hypixel/player/stats/${api.username}`)
            .setThumbnail(uhg.getAvatar(api.uuid))
            .setColor(gen.color || 0x55FFFF);

        // --- SEKCE: HYPIXEL ---
        const lastLogin = gen.lastLogin ? `<t:${Math.round(gen.lastLogin / 1000)}:R>` : "`API OFF`";
        const firstLogin = gen.firstLogin ? `<t:${Math.round(gen.firstLogin / 1000)}:D>` : "`???`";

        embed.addFields(
            { name: "Rank", value: `${gen.prefix || gen.rank}`, inline: true },
            { name: "Level", value: `${Math.floor(gen.level)}`, inline: true },
            { name: "Karma", value: `${uhg.f(gen.karma)}`, inline: true },
            { name: "AP", value: `${uhg.f(gen.aps)}`, inline: true },
            { name: "Jazyk", value: `${gen.userLanguage || "ENGLISH"}`, inline: true },
            { name: "Naposledy online", value: lastLogin, inline: true },
            { name: "První připojení", value: firstLogin, inline: false }
        );

        // --- SEKCE: GUILDA & GEXP ---
        if (guild.guild) {
            let weeklyGexp = 0;
            let monthlyGexp = 0;
            const now = new Date();
            const currentMonth = now.toISOString().slice(0, 7);
            
            const dbG = userInDb?.guilds?.find(g => g.name === guild.name);
            
            if (dbG && dbG.exp) {
                const last7Days = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(); d.setDate(d.getDate() - i);
                    last7Days.push(d.toISOString().slice(0, 10));
                }
                last7Days.forEach(day => weeklyGexp += (dbG.exp[day] || 0));

                for (const [date, val] of Object.entries(dbG.exp)) {
                    if (date.startsWith(currentMonth)) monthlyGexp += val;
                }
            } else if (guild.member?.expHistory) {
                weeklyGexp = Object.values(guild.member.expHistory).reduce((a, b) => a + b, 0);
            }

            const joined = guild.member?.joined || dbG?.joined;
            const joinedStr = joined ? `<t:${Math.round(joined / 1000)}:D> (<t:${Math.round(joined / 1000)}:R>)` : "`???`";

            embed.addFields({
                name: `Guilda: ${guild.name} [${guild.tag}]`,
                value: `• **Rank:** \`${guild.member.rank}\`\n` +
                       `• **Joined:** ${joinedStr}\n` +
                       `• **Weekly GEXP:** \`${uhg.f(weeklyGexp)}\`\n` +
                       `• **Monthly GEXP:** \`${uhg.f(monthlyGexp)}\``,
                inline: false
            });
        }

        // --- SEKCE: UHG STATUS ---
        let discordStatus = userInDb?.discordId ? `✅ <@${userInDb.discordId}>` : "🟥 Ne";
        let dbStatus = userInDb?.stats ? `✅ Sledován (<t:${Math.round(userInDb.updated/1000)}:R>)` : "🟥 Neukládá se";
        let hpDiscord = gen.links?.DISCORD || "Není nastaven";

        embed.addFields(
            { name: "Discord (Hypixel)", value: `\`${hpDiscord}\``, inline: true },
            { name: "Verifikován (UHG)", value: discordStatus, inline: true },
            { name: "Stats v DB", value: dbStatus, inline: true }
        );

        // --- FOOTER: ONLINE STATUS ---
        let statusText = api.online.online ? `🟢 Online: ${api.online.game || "Lobby"}` : "🔴 Offline";
        if (api.online.map) statusText += ` (${api.online.map})`;
        embed.setFooter({ text: statusText });

        await interaction.editReply({ embeds: [embed] });
    }
};
/**
 * src/discord/commandsSlash/badges.js
 * Přehled požadavků na odznáčky a kontrola nároku hráče.
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'badges',
    description: 'Zobrazí seznam badges nebo zkontroluje hráče',
    permissions: [],
    options: [
        { name: "player", description: "Jméno hráče", type: 3, required: false },
        { name: "user", description: "Discord uživatel", type: 6, required: false }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        if (uhg.roles.badges.length === 0) await uhg.roles.loadBadges();
        const badges = uhg.roles.badges;

        const playerArg = interaction.options.getString('player');
        const userArg = interaction.options.getUser('user');

        // A. SEZNAM VŠECH BADGES (Beze změny)
        if (!playerArg && !userArg) {
            const embed = new uhg.dc.Embed()
                .setTitle('📜 UHG Badges')
                .setColor(0x55FFFF)
                .setDescription('Seznam odznaků a požadavků.');

            for (const badge of badges) {
                let desc = "";
                for (let i = 0; i < badge.stats.length; i++) {
                    const statName = badge.statsNames ? badge.statsNames[i] : badge.stats[i];
                    const reqs = badge.req[i].map(n => uhg.f(n)); 
                    desc += `• **${statName}:** ${reqs.join(' / ')}\n`;
                }
                const roleNames = badge.roles.map(r => `<@&${r.id}>`).join(' -> ');
                embed.addFields({ 
                    name: interaction.guild.id === uhg.config.guildId ? `${badge.name} (${roleNames})` : `${badge.name})`, 
                    value: desc || "Chyba definice", 
                    inline: false 
                });
            }
            return interaction.editReply({ embeds: [embed] });
        }

        // B. KONTROLA HRÁČE
        let username = playerArg;
        let uuid = null;

        if (userArg) {
            const dbUser = await uhg.db.getVerify(userArg.id);
            if (dbUser) { username = dbUser.nickname; uuid = dbUser.uuid; }
            else return interaction.editReply(`❌ Uživatel ${userArg} není verifikovaný.`);
        } else if (!username) {
            const dbUser = await uhg.db.getVerify(interaction.user.id);
            if (dbUser) { username = dbUser.nickname; uuid = dbUser.uuid; }
            else return interaction.editReply("❌ Nejsi verifikovaný.");
        }

        if (!uuid) {
            const api = await uhg.api.getMojang(username);
            if (api.success) uuid = api.uuid;
            else return interaction.editReply(`❌ Hráč ${username} nenalezen.`);
        }

        const stats = await uhg.db.getStats(uuid);
        if (!stats) return interaction.editReply(`❌ Hráč **${username}** není v databázi statistik.`);
        // Struktura stats je: { _id, uuid, stats: { bedwars: {}, skywars: {} } }
        const dbData = stats; 

        const embed = new uhg.dc.Embed()
            .setTitle(`Badges: ${uhg.dontFormat(username)}`)
            .setThumbnail(uhg.getAvatar(uuid))
            .setColor('Gold');

        let totalOwned = 0;

        for (const badge of badges) {
            const result = badge.getRole(badge.name, dbData);
            
            let currentRole = result.role.name === 'Žádná role' ? null : result.role;
            let tierIndex = -1;
            if (currentRole) {
                tierIndex = badge.roles.findIndex(r => r.id === currentRole.id);
            }

            let statusIcon = "❌";
            if (tierIndex === 0) statusIcon = "🥉";
            if (tierIndex === 1) statusIcon = "🥈";
            if (tierIndex === 2) statusIcon = "🥇";

            if (tierIndex >= 0) totalOwned++;

            // VÝPIS PROGRESU (Pro Embed)
            let progressDesc = "";
            for (let i = 0; i < badge.stats.length; i++) {
                const statKey = (badge.path || "") + badge.stats[i];

                // 1. Očistíme cestu, aby zbyla jen cesta uvnitř hry (např. "bedwars/overall/finalKills")
                let cleanPath = statKey
                    .replace(/^hypixel\//, '')
                    .replace(/^stats\//, '')
                    .replace(/\/\//g, '/');

                // 2. Hledáme v datech her (dbData.stats)
                // Pokud je cesta "bedwars/wins", hledáme v dbData.stats["bedwars"]["wins"]
                let val = uhg.path(cleanPath, dbData.stats);
                val = Number(val) || 0;

                const reqs = badge.req[i];
                const statName = badge.statsNames ? badge.statsNames[i] : statKey;

                let nextTarget = "MAX";
                if (val < reqs[0]) nextTarget = uhg.f(reqs[0]);
                else if (val < reqs[1]) nextTarget = uhg.f(reqs[1]);
                else if (val < reqs[2]) nextTarget = uhg.f(reqs[2]);

                progressDesc += `• ${statName}: **${uhg.f(val)}** / ${nextTarget}\n`;
            }

            embed.addFields({
                name: `${statusIcon} ${badge.name} ${currentRole ? `(${currentRole.name})` : ''}`,
                value: progressDesc,
                inline: true
            });
        }

        embed.setDescription(`Hráč vlastní **${totalOwned}** / **${badges.length}** odznaků.`);
        embed.setFooter({ text: "Data jsou z cache databáze (nemusí být 100% aktuální)." });

        await interaction.editReply({ embeds: [embed] });
    }
};
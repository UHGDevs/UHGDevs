/**
 * src/discord/commandsSlash/badges.js
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'badges',
    description: 'Zobrazí seznam badges nebo progres hráče',
    options: [
        { name: "player", description: "Jméno hráče", type: 3, required: false },
        { name: "user", description: "Discord uživatel", type: 6, required: false }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        // Načtení badges pokud nejsou v paměti
        if (uhg.roles.badges.length === 0) await uhg.roles.loadBadges();
        const badges = uhg.roles.badges;

        const playerArg = interaction.options.getString('player');
        const userArg = interaction.options.getUser('user');

        // --- A. SEZNAM POŽADAVKŮ (Bez argumentu) ---
        if (!playerArg && !userArg) {
            const embed = new uhg.dc.Embed()
                .setTitle('📜 UHG Badges - Požadavky')
                .setColor(0x55FFFF)
                .setDescription('Pro získání role musíš splnit **všechny** statistiky v dané kategorii.');

            for (const badge of badges) {
                let desc = "";
                for (let i = 0; i < badge.stats.length; i++) {
                    const statName = badge.statsNames ? badge.statsNames[i] : badge.stats[i];
                    const reqs = badge.req[i].map(n => uhg.f(n)); 
                    desc += `• **${statName}:** ${reqs.join(' / ')}\n`;
                }
                embed.addFields({ name: badge.name, value: desc || "Chyba definice", inline: true });
            }
            return interaction.editReply({ embeds: [embed] });
        }

        // --- B. KONTROLA PROGRESU HRÁČE ---
        let targetId = userArg ? userArg.id : (playerArg || interaction.user.id);
        
        // Získáme uživatele z nové sjednocené kolekce 'users'
        const userData = await uhg.db.getUser(targetId);

        if (!userData) {
            return interaction.editReply(`❌ Hráč **${playerArg || targetId}** nebyl nalezen v databázi.`);
        }

        const embed = new uhg.dc.Embed()
            .setTitle(`Badges: ${uhg.dontFormat(userData.username)}`)
            .setThumbnail(uhg.getAvatar(userData._id))
            .setColor('Gold');

        let totalOwned = 0;

        for (const badge of badges) {
            const result = badge.getRole(badge.name, userData);
            const tierIndex = result.tier; // Použijeme nově přidaný tier z Uhg.js

            if (tierIndex >= 0) totalOwned++;

            let statusIcon = "❌";
            if (tierIndex === 0) statusIcon = "🥉";
            if (tierIndex === 1) statusIcon = "🥈";
            if (tierIndex === 2) statusIcon = "🥇";

            let progressDesc = "";
            for (let i = 0; i < badge.stats.length; i++) {
                const statKey = badge.stats[i];
                const fullPath = ((badge.path || "") + statKey).replace(/^hypixel\//, '').replace(/\//g, '.').replace(/\.\./g, '.').replace(/^\.|\.$/g, '');
                
                const val = fullPath.split('.').reduce((o, k) => (o || {})[k], userData) || 0;
                const reqs = badge.req[i];
                const statName = badge.statsNames ? badge.statsNames[i] : statKey;

                // Ukazujeme cíl podle aktuálního tieru
                let nextTarget = reqs[0]; // Cíl pro Trained
                if (tierIndex === 0) nextTarget = reqs[1]; // Cíl pro Expert
                if (tierIndex === 1) nextTarget = reqs[2]; // Cíl pro God
                if (tierIndex === 2) nextTarget = "MAX";

                progressDesc += `• ${statName}: **${uhg.f(val)}** / ${typeof nextTarget === 'number' ? uhg.f(nextTarget) : nextTarget}\n`;
            }

            embed.addFields({
                name: `${statusIcon} ${badge.name}`,
                value: progressDesc,
                inline: true
            });
        }

        embed.setDescription(`Hráč splňuje **${totalOwned}** / **${badges.length}** kategorií.`);
        embed.setFooter({ text: "Data pochází z poslední aktualizace statistik." });

        await interaction.editReply({ embeds: [embed] });
    }
};
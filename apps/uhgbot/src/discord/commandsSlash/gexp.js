/**
 * src/discord/commandsSlash/gexp.js
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.resolve(__dirname, '../../../cache');
const CACHE_PATH = path.join(CACHE_DIR, 'gexp.json');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports = {
    name: 'gexp',
    description: 'Zobrazí GEXP leaderboard guildy',
    permissions: [],
    options: [
        {
            name: "period",
            description: "Časový úsek",
            type: "STRING",
            required: true,
            choices: [
                { name: 'Denní (Daily)', value: 'd' },
                { name: 'Týdenní (Weekly)', value: 'w' },
                { name: 'Měsíční (Monthly)', value: 'm' },
                { name: 'Roční (Yearly)', value: 'y' },
                { name: 'Celkový (Total)', value: 't' }
            ]
        },
        { name: "guild", description: "Kterou guildu chceš vidět?", type: "STRING", required: false, choices: [{ name: 'UHG', value: 'UltimateHypixelGuild' }, { name: 'TKJK', value: 'TKJK' }] },
        { name: "datum", description: "Konkrétní datum", type: "STRING", required: false }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();
        const period = interaction.options.getString('period');
        const guildName = interaction.options.getString('guild') || 'UltimateHypixelGuild';
        const rawDate = interaction.options.getString('datum');

        // 1. PŘÍPRAVA FILTRU A ID CACHE
        // Potřebujeme to vědět hned na začátku, abychom mohli zkontrolovat cache
        const guildData = await uhg.db.run.get("stats", "guild", { name: guildName }).then(res => res[0]);
        if (!guildData || !guildData.members.length) return interaction.editReply(`❌ Data pro guildu **${guildName}** nebyla nalezena.`);

        const sampleHistory = guildData.members[0].exp.daily || {};
        const availableDates = Object.keys(sampleHistory).sort().reverse();

        let filterPrefix = "";
        let titleSuffix = "";

        if (rawDate) {
            filterPrefix = rawDate.replace(/[ .]/g, "-");
            titleSuffix = `(${filterPrefix})`;
        } else if (period === 'd') {
            if (availableDates.length > 0) {
                filterPrefix = availableDates[0];
                titleSuffix = filterPrefix.split('-').reverse().join('. ');
            } else return interaction.editReply("❌ V databázi nejsou žádná historická data.");
        } else if (period === 'w') {
            filterPrefix = "WEEKLY";
            titleSuffix = "Posledních 7 dní";
        } else if (period === 'm') {
            const today = new Date();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            filterPrefix = `${yyyy}-${mm}`;
            titleSuffix = `Měsíc ${mm} ${yyyy}`;
        } else if (period === 'y') {
            filterPrefix = `${new Date().getFullYear()}`;
            titleSuffix = `Rok ${filterPrefix}`;
        } else {
            filterPrefix = "TOTAL";
            titleSuffix = "Celkem";
        }

        // --- OPTIMALIZACE: KONTROLA CACHE ---
        // ID je nyní deterministické (stejné pro stejný dotaz)
        const cacheId = `${guildName}_${period}_${filterPrefix}`;
        let cacheFile = {};
        try { if (fs.existsSync(CACHE_PATH)) cacheFile = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch (e) {}

        // Pokud máme v cache čerstvá data (mladší než 1 hodina), použijeme je a nepočítáme znovu
        // (Výjimka: pokud někdo explicitně zadá datum, asi chce vidět, jestli se něco nezměnilo, ale pro běžný provoz stačí)
        if (cacheFile[cacheId] && cacheFile[cacheId].timestamp > Date.now() - (1000 * 60 * 60)) {
            const cachedData = cacheFile[cacheId];
            const buttons = createButtons(cacheId, cachedData.pages.length);
            return interaction.editReply({ embeds: [cachedData.pages[0]], components: [buttons] });
        }

        // 2. VÝPOČET STATISTIK (Pokud nejsou v cache)
        const allMembers = [...(guildData.members || []), ...(guildData.left || [])];
        const leaderboard = [];
        let totalRawGexp = 0;

        for (const member of allMembers) {
            let xp = 0;
            const history = member.exp ? member.exp.daily : {};

            if (period === 't') xp = Object.values(history).reduce((a, b) => a + b, 0);
            else if (filterPrefix === "WEEKLY") {
                const days = Object.keys(history).sort().reverse().slice(0, 7);
                days.forEach(day => xp += history[day] || 0);
            } else {
                Object.keys(history).forEach(day => {
                    if (day.startsWith(filterPrefix)) xp += history[day];
                });
            }

            if (xp > 0 || guildData.members.find(m => m.uuid === member.uuid)) {
                totalRawGexp += xp;
                leaderboard.push({ name: member.name, xp: xp, left: !guildData.members.find(m => m.uuid === member.uuid) });
            }
        }

        leaderboard.sort((a, b) => b.xp - a.xp);

        if (leaderboard.length === 0) return interaction.editReply(`❌ Pro období **${titleSuffix}** nebyla nalezena žádná data.`);

        let totalScaledGexp = 0;
        if (guildData.dailyxp) {
            if (period === 't') totalScaledGexp = guildData.totalxp;
            else if (filterPrefix === "WEEKLY") {
                const days = Object.keys(guildData.dailyxp).sort().reverse().slice(0, 7);
                days.forEach(day => totalScaledGexp += guildData.dailyxp[day] || 0);
            } else {
                Object.keys(guildData.dailyxp).forEach(day => {
                    if (day.startsWith(filterPrefix)) totalScaledGexp += guildData.dailyxp[day];
                });
            }
        }
        if (totalScaledGexp === 0 && filterPrefix !== "TOTAL") totalScaledGexp = totalRawGexp;

        // 3. STRÁNKOVÁNÍ
        const pageSize = 15;
        const pages = [];
        const header = `**GEXP Statistiky:**\n` +
                       `• Total Raw: \`${uhg.f(totalRawGexp)}\`\n` +
                       `• Total Scaled: \`${uhg.f(totalScaledGexp)}\`\n` +
                       `• Průměr (Raw): \`${uhg.f(Math.round(totalRawGexp / leaderboard.length))}\`\n\n` +
                       `**Leaderboard:**`;

        for (let i = 0; i < leaderboard.length; i += pageSize) {
            const chunk = leaderboard.slice(i, i + pageSize);
            const description = header + "\n" + chunk.map((p, index) => {
                const rank = i + index + 1;
                const nameStyle = p.left ? `*${p.name}*` : `**${p.name}**`;
                return `\`#${rank}\` ${nameStyle}: \`${uhg.f(p.xp)}\``;
            }).join('\n');

            pages.push({
                title: `${guildName} GEXP - ${titleSuffix}`,
                color: 0x55FFFF,
                description: description,
                footer: { text: `Strana ${pages.length + 1}/${Math.ceil(leaderboard.length / pageSize)} • ${leaderboard.length} hráčů` },
                timestamp: new Date().toISOString()
            });
        }

        // 4. ULOŽENÍ DO CACHE A ÚDRŽBA
        // Promazání starých záznamů (30 dní = 2592000000 ms)
        const MAX_AGE = 1000 * 60 * 60 * 24 * 30;
        const now = Date.now();
        for (const key in cacheFile) {
            if (cacheFile[key].timestamp < now - MAX_AGE) delete cacheFile[key];
        }

        cacheFile[cacheId] = { pages, timestamp: now };
        
        // Asynchronní zápis (neblokuje)
        fs.writeFile(CACHE_PATH, JSON.stringify(cacheFile), (err) => { if (err) console.error("Cache write error:", err); });

        const buttons = createButtons(cacheId, pages.length);
        await interaction.editReply({ embeds: [pages[0]], components: [buttons] });
    },

    changePage: async (uhg, interaction) => {
        const parts = interaction.customId.split('_');

        const cacheId = parts.slice(2, 5).join('_'); // Zde je nyní např. "UltimateHypixelGuild_m_2023-10"
        const action = parts[5];

        let cacheFile = {};
        try { if (fs.existsSync(CACHE_PATH)) cacheFile = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch (e) {
                await uhg.disableAllComponents(interaction);
                return interaction.reply({ content: "❌ Data vypršela.", flags: [MessageFlags.Ephemeral] })
        }

        const data = cacheFile[cacheId];
        if (!data) {
            await uhg.disableAllComponents(interaction);
            return interaction.reply({ content: "❌ Data vypršela (starší než 30 dní).", flags: [MessageFlags.Ephemeral] });
        }
        let currentPage = 0;
        try {
            const footer = interaction.message.embeds[0].footer.text;
            currentPage = parseInt(footer.split(' ')[1].split('/')[0]) - 1;
        } catch (e) {}

        const maxPage = data.pages.length - 1;
        let newPage = currentPage;

        if (action === '0') newPage = 0;
        else if (action === 'last') newPage = maxPage;
        else if (action === 'prev') newPage = Math.max(0, currentPage - 1);
        else if (action === 'next') newPage = Math.min(maxPage, currentPage + 1);

        if (newPage === currentPage) return interaction.deferUpdate();

        const buttons = createButtons(cacheId, data.pages.length, newPage);
        await interaction.update({ embeds: [data.pages[newPage]], components: [buttons] });
    }
};

// Pomocná funkce pro tlačítka
function createButtons(cacheId, totalPages, currentPage = 0) {
    const maxPage = totalPages - 1;
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_0`).setEmoji('⏮').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_prev`).setEmoji('◀').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_next`).setEmoji('▶').setStyle(ButtonStyle.Primary).setDisabled(currentPage === maxPage),
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_last`).setEmoji('⏭').setStyle(ButtonStyle.Primary).setDisabled(currentPage === maxPage)
    );
}
/**
 * src/discord/commandsSlash/lb.js
 * Optimalizovaný Leaderboard s MongoDB Projection.
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.resolve(__dirname, '../../../cache');
const CACHE_PATH = path.join(CACHE_DIR, 'lb.json');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports = {
    name: 'lb',
    description: 'Zobrazí žebříček hráčů',
    permissions: [],
    options: [
        {
            name: "minigame",
            description: "Vyber minihru",
            type: 3,
            required: true,
            autocomplete: true
        },
        {
            name: "gamemode",
            description: "Vyber mód",
            type: 3,
            required: true, // Nyní povinné, aby se načetly správné staty
            autocomplete: true
        },
        {
            name: "stat",
            description: "Vyber statistiku",
            type: 3,
            required: true,
            autocomplete: true
        },
        {
            name: "find_player",
            description: "Najít umístění hráče",
            type: 3,
            required: false
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        const game = interaction.options.getString('minigame');
        const mode = interaction.options.getString('gamemode');
        const statKey = interaction.options.getString('stat');
        const searchPlayer = interaction.options.getString('find_player');

        // 1. ZÍSKÁNÍ KONFIGURACE Z HELPERU
        const config = uhg.lbHelper.getConfig(game, mode, statKey);
        
        if (!config) {
            return interaction.editReply("❌ Neplatná kombinace hry, módu a statistiky.");
        }

        // 2. DOTAZ DO DB
        const projection = uhg.lbHelper.getProjection(config);
        const data = await uhg.db.mongo.db("stats").collection("stats")
            .find({}, { projection: projection })
            .toArray();

        if (!data.length) return interaction.editReply("❌ Databáze statistik je prázdná.");


        // 3. ZPRACOVÁNÍ HODNOT
        const leaderboard = [];
        
        for (const player of data) {
            // Hodnota pro řazení (číslo)
            let sortValue = uhg.lbHelper.getValue(player, config.dbPath);
            
            // Hodnota pro zobrazení (může být string, např. "15✫")
            let displayValue = uhg.lbHelper.getValue(player, config.displayPath, config.transform);

            // Pokud není display definovaný v JSONu jinak, je stejný jako sortValue
            if (displayValue === undefined) displayValue = sortValue;

            // Základní formátování čísel, pokud to není string
            if (typeof displayValue === 'number') displayValue = uhg.f(displayValue);

            // Filtrování nulových hodnot (kromě ratio stats)
            if (sortValue > 0 || ['kdr', 'wlr', 'fkdr'].includes(statKey)) {
                leaderboard.push({
                    username: player.username,
                    value: Number(sortValue) || 0,
                    display: displayValue
                });
            }
        }

        // 4. SEŘAZENÍ
        leaderboard.sort((a, b) => b.value - a.value);

        if (leaderboard.length === 0) return interaction.editReply(`❌ Žádná data pro **${config.name}**.`);

        // 5. VYHLEDÁNÍ HRÁČE
        let startPage = 0;
        let foundIndex = -1;
        if (searchPlayer) {
            foundIndex = leaderboard.findIndex(p => p.username.toLowerCase() === searchPlayer.toLowerCase());
            if (foundIndex !== -1) startPage = Math.floor(foundIndex / 20);
            else await interaction.followUp({ content: `⚠️ Hráč **${searchPlayer}** nebyl v žebříčku nalezen.`, ephemeral: true });
        }

        // 6. STRÁNKOVÁNÍ
        const pageSize = 20;
        const pages = [];
        const total = leaderboard.length;
        const niceStatName = uhg.lbHelper.getStatName(game, mode, statKey);
        const niceGameName = uhg.lbHelper.getGameName(game);
        const niceModeName = uhg.lbHelper.getModeName(game, mode);

        for (let i = 0; i < total; i += pageSize) {
            const chunk = leaderboard.slice(i, i + pageSize);
            const description = chunk.map((p, index) => {
                const rank = i + index + 1;
                const nameStyle = (i + index) === foundIndex ? `**${uhg.dontFormat(p.username)}**` : `**${uhg.dontFormat(p.username)}**`; // `__**${uhg.dontFormat(p.username)}**__` : `**${uhg.dontFormat(p.username)}**`;
                let icon = `\`#${rank}\``;
                if (rank === 1) icon = "🥇";
                if (rank === 2) icon = "🥈";
                if (rank === 3) icon = "🥉";
                return `${icon} ${nameStyle}: \`${p.display}\``;
            }).join('\n');

            pages.push({
                title: `${niceGameName} - ${niceStatName}`,
                color: 0x55FFFF,
                description: `**Mód:** ${niceModeName}\n\n${description}`,
                footer: { text: `Strana ${pages.length + 1}/${Math.ceil(total / pageSize)} • Hráčů: ${total}` },
                timestamp: new Date().toISOString()
            });
        }

        // 7. CACHE A ODESLÁNÍ
        const cacheId = `${game}_${statKey}_${mode}`;
        saveToCache(cacheId, pages);

        const buttons = createButtons(cacheId, pages.length, startPage);
        await interaction.editReply({ embeds: [pages[startPage]], components: [buttons] });
    },

    // --- BUTTON INTERACTION ---
    changePage: async (uhg, interaction) => {
        const parts = interaction.customId.split('_');
        const cacheId = parts.slice(2, 5).join('_');
        const action = parts[5];

        const data = loadFromCache(cacheId);
        if (!data) {
            await uhg.disableAllComponents(interaction);
            return interaction.reply({ content: "❌ Data vypršela.", flags: [MessageFlags.Ephemeral] });
        }

        let currentPage = 0;
        try {
            const footerText = interaction.message.embeds[0].footer.text;
            currentPage = parseInt(footerText.split(' ')[1].split('/')[0]) - 1;
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
    },
    // --- AUTOCOMPLETE (Používá helper) ---
    autocomplete: async (uhg, interaction) => {
        const focused = interaction.options.getFocused(true);
        const search = focused.value.toLowerCase();
        
        // 1. Výběr hry
        if (focused.name === 'minigame') {
            await interaction.respond(uhg.lbHelper.getGames(search));
        } 
        // 2. Výběr módu (závisí na hře)
        else if (focused.name === 'gamemode') {
            const game = interaction.options.getString('minigame');
            if (game) await interaction.respond(uhg.lbHelper.getModes(game, search));
            else await interaction.respond([{name: "Nejdřív vyber minihru", value: "null"}]);
        } 
        // 3. Výběr statistiky (závisí na módu)
        else if (focused.name === 'stat') {
            const game = interaction.options.getString('minigame');
            const mode = interaction.options.getString('gamemode');
            
            if (game && mode) await interaction.respond(uhg.lbHelper.getStats(game, mode, search));
            else if (game) await interaction.respond([{name: "Nejdřív vyber mód", value: "null"}]);
            else await interaction.respond([{name: "Nejdřív vyber minihru", value: "null"}]);
        }
    }
};

// --- POMOCNÉ FUNKCE ---
function createButtons(cacheId, totalPages, currentPage = 0) {
    const maxPage = totalPages - 1;
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_0`).setEmoji('⏮').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_prev`).setEmoji('◀').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_next`).setEmoji('▶').setStyle(ButtonStyle.Primary).setDisabled(currentPage === maxPage),
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_last`).setEmoji('⏭').setStyle(ButtonStyle.Primary).setDisabled(currentPage === maxPage)
    );
}

function saveToCache(id, pages) {
    let cache = {};
    try { if (fs.existsSync(CACHE_PATH)) cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch (e) {}
    const now = Date.now();
    for (const key in cache) { if (cache[key].timestamp < now - 3600000) delete cache[key]; }
    cache[id] = { pages, timestamp: now };
    fs.writeFile(CACHE_PATH, JSON.stringify(cache), () => {});
}

function loadFromCache(id) {
    try {
        if (fs.existsSync(CACHE_PATH)) {
            const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
            return cache[id];
        }
    } catch (e) {}
    return null;
}
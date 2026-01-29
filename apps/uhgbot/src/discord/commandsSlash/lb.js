/**
 * src/discord/commandsSlash/lb.js
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.resolve(__dirname, '../../../cache');
const CACHE_PATH = path.join(CACHE_DIR, 'lb.json');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports = {
    name: 'lb',
    description: 'Zobrazí žebříček hráčů z CZ/SK databáze',
    options: [
        { name: "minigame", description: "Hra (např. BedWars)", type: 3, required: true, autocomplete: true },
        { name: "gamemode", description: "Mód (např. overall)", type: 3, required: true, autocomplete: true },
        { name: "stat", description: "Statistika (např. wins)", type: 3, required: true, autocomplete: true },
        { name: "find_player", description: "Najít konkrétního hráče", type: 3, required: false }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        const game = interaction.options.getString('minigame');
        const mode = interaction.options.getString('gamemode');
        const statKey = interaction.options.getString('stat');
        const searchPlayer = interaction.options.getString('find_player');

        // 1. ZÍSKÁNÍ KONFIGURACE
        const config = uhg.lbHelper.getConfig(game, mode, statKey);
        if (!config) return interaction.editReply("❌ Neplatná kombinace hry, módu a statistiky.");

        // 2. DOTAZ DO DB (Nová kolekce 'users')
        const projection = uhg.lbHelper.getProjection(config);
        
        // Hledáme jen lidi, kteří mají danou statistiku (aby LB nebyl plný nul)
        const query = { [config.dbPath]: { $exists: true, $ne: null } };
        
        const data = await uhg.db.db.collection("users")
            .find(query, { projection })
            .toArray();

        if (!data.length) return interaction.editReply("❌ V databázi nejsou pro tuto statistiku žádná data.");

        // 3. ZPRACOVÁNÍ A SEŘAZENÍ
        const leaderboard = [];
        for (const player of data) {
            const sortValue = uhg.lbHelper.getValue(player, config.dbPath);
            const displayValue = uhg.lbHelper.getValue(player, config.displayPath, config.transform) ?? sortValue;

            if (sortValue !== undefined && sortValue !== null) {
                leaderboard.push({
                    username: player.username || "Neznámý",
                    value: Number(sortValue) || 0,
                    display: typeof displayValue === 'number' ? uhg.f(displayValue) : displayValue
                });
            }
        }

        leaderboard.sort((a, b) => b.value - a.value);

        // 4. STRÁNKOVÁNÍ
        let startPage = 0;
        let foundIndex = -1;
        if (searchPlayer) {
            foundIndex = leaderboard.findIndex(p => p.username.toLowerCase() === searchPlayer.toLowerCase());
            if (foundIndex !== -1) startPage = Math.floor(foundIndex / 20);
        }

        const pageSize = 20;
        const pages = [];
        const total = leaderboard.length;
        const cacheId = `lb${game}${mode}${statKey}`.replace(/[^a-zA-Z0-9]/g, '');

        for (let i = 0; i < total; i += pageSize) {
            const chunk = leaderboard.slice(i, i + pageSize);
            const description = chunk.map((p, index) => {
                const rank = i + index + 1;
                // Zvýraznění hledaného hráče
                const nameStr = (i + index) === foundIndex ? `__**${uhg.dontFormat(p.username)}**__` : `**${uhg.dontFormat(p.username)}**`;
                
                let medal = `\`#${rank}\``;
                if (rank === 1) medal = "🥇";
                if (rank === 2) medal = "🥈";
                if (rank === 3) medal = "🥉";

                return `${medal} ${nameStr}: \`${p.display}\``;
            }).join('\n');

            pages.push(new uhg.dc.Embed()
                .setTitle(`${uhg.lbHelper.getGameName(game)} - ${uhg.lbHelper.getStatName(game, mode, statKey)}`)
                .setColor(0x55FFFF)
                .setDescription(`**Mód:** ${uhg.lbHelper.getModeName(game, mode)}\n\n${description}`)
                .setFooter({ text: `Strana ${pages.length + 1}/${Math.ceil(total / pageSize)} • Hráčů: ${total}` })
                .setTimestamp()
            );
        }

        // 5. CACHE A ODESLÁNÍ
        saveToCache(cacheId, pages);
        const buttons = createButtons(cacheId, pages.length, startPage);
        await interaction.editReply({ embeds: [pages[startPage]], components: [buttons] });
    },

    /**
     * Přepínání stránek
     */
    changePage: async (uhg, interaction) => {
        const parts = interaction.customId.split('_');
        const cacheId = parts[2];
        const action = parts[3];

        const data = loadFromCache(cacheId);
        if (!data) return interaction.reply({ content: "❌ Data vypršela.", flags: [MessageFlags.Ephemeral] });

        let currentPage = parseInt(interaction.message.embeds[0].footer.text.split(' ')[1].split('/')[0]) - 1;
        let newPage = currentPage;

        if (action === '0') newPage = 0;
        else if (action === 'prev') newPage = Math.max(0, currentPage - 1);
        else if (action === 'next') newPage = Math.min(data.pages.length - 1, currentPage + 1);
        else if (action === 'last') newPage = data.pages.length - 1;

        if (newPage === currentPage) return interaction.deferUpdate();

        const buttons = createButtons(cacheId, data.pages.length, newPage);
        await interaction.update({ embeds: [data.pages[newPage]], components: [buttons] });
    },

    /**
     * Autocomplete (Našeptávač)
     */
    autocomplete: async (uhg, interaction) => {
        const focused = interaction.options.getFocused(true);
        const search = focused.value.toLowerCase();
        
        if (focused.name === 'minigame') return interaction.respond(uhg.lbHelper.getGames(search));
        
        const game = interaction.options.getString('minigame');
        if (focused.name === 'gamemode') {
            if (!game) return interaction.respond([{name: "Nejdříve vyber hru", value: "null"}]);
            return interaction.respond(uhg.lbHelper.getModes(game, search));
        }

        const mode = interaction.options.getString('gamemode');
        if (focused.name === 'stat') {
            if (!game || !mode) return interaction.respond([{name: "Vyber hru a mód", value: "null"}]);
            return interaction.respond(uhg.lbHelper.getStats(game, mode, search));
        }
    }
};

// --- POMOCNÉ FUNKCE CACHE ---

function createButtons(cacheId, totalPages, currentPage) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_0`).setEmoji('⏮').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_prev`).setEmoji('◀').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_next`).setEmoji('▶').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
        new ButtonBuilder().setCustomId(`lb_changePage_${cacheId}_last`).setEmoji('⏭').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1)
    );
}

function saveToCache(id, pages) {
    let cache = {};
    try { if (fs.existsSync(CACHE_PATH)) cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch (e) {}
    const now = Date.now();
    for (const key in cache) { if (cache[key].timestamp < now - 3600000) delete cache[key]; }
    cache[id] = { pages, timestamp: now };
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
}

function loadFromCache(id) {
    try {
        const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
        return cache[id];
    } catch (e) { return null; }
}
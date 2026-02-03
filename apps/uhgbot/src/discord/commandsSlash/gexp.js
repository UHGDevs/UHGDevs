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
    description: 'Leaderboard GEXP',
    permissions: [],
    options: [
        {
            name: "period",
            description: "Časový úsek",
            type: 3,
            required: true,
            choices: [
                { name: 'Denní (Daily)', value: 'd' },
                { name: 'Týdenní (Weekly)', value: 'w' },
                { name: 'Měsíční (Monthly)', value: 'm' },
                { name: 'Roční (Yearly)', value: 'y' },
                { name: 'Celkový (Total)', value: 't' }
            ]
        },
        { 
            name: "guild", 
            description: "Která guilda?", 
            type: 3, 
            choices: [{ name: 'UHG', value: 'UltimateHypixelGuild' }, { name: 'TKJK', value: 'TKJK' }] 
        },
        { name: "date", description: "Referenční datum (YYYY-MM-DD nebo YYYY-MM)", type: 3 }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        const period = interaction.options.getString('period');
        const guildName = interaction.options.getString('guild') || 'UltimateHypixelGuild';
        const customDate = interaction.options.getString('date');

        const now = new Date();
        let refDate = now;

        if (customDate) {
            const parsedDate = new Date(customDate.length === 7 ? `${customDate}-01` : customDate);
            if (!isNaN(parsedDate)) refDate = parsedDate;
        }

        let dayList = [];
        let filterPrefix = "";
        let titleSuffix = "";

        if (period === 'd') {
            filterPrefix = refDate.toISOString().slice(0, 10);
            dayList = [filterPrefix];
            titleSuffix = filterPrefix;
        } else if (period === 'w') {
            for (let i = 0; i < 7; i++) {
                const d = new Date(refDate);
                d.setDate(d.getDate() - i);
                dayList.push(d.toISOString().slice(0, 10));
            }
            titleSuffix = `Týden (${dayList[6]} až ${dayList[0]})`;
        } else if (period === 'm') {
            filterPrefix = refDate.toISOString().slice(0, 7);
            titleSuffix = `Měsíc ${filterPrefix}`;
        } else if (period === 'y') {
            filterPrefix = refDate.getFullYear().toString();
            titleSuffix = `Rok ${filterPrefix}`;
        } else {
            titleSuffix = "Celková historie";
        }

        // ZÍSKÁNÍ SCALED EXP
        let totalScaled = 0;
        let gsQuery = { guild: guildName };
        if (dayList.length) gsQuery.date = { $in: dayList };
        else if (filterPrefix) gsQuery.date = { $regex: new RegExp(`^${filterPrefix}`) };

        const guildHistory = await uhg.db.db.collection("guild_stats").find(gsQuery).toArray();
        guildHistory.forEach(d => totalScaled += (d.dailyScaledExp || 0));

        // ZÍSKÁNÍ RAW EXP
        const members = await uhg.db.db.collection("users").find(
            { "guilds.name": guildName },
            { projection: { username: 1, guilds: 1 } }
        ).toArray();

        const leaderboard = [];
        let totalRaw = 0;

        for (const user of members) {
            const gData = user.guilds.find(g => g.name === guildName);
            if (!gData || !gData.exp) continue;

            let userXp = 0;
            if (period === 't') {
                userXp = Object.values(gData.exp).reduce((a, b) => a + b, 0);
            } else if (dayList.length > 0) {
                dayList.forEach(d => userXp += (gData.exp[d] || 0));
            } else if (filterPrefix) {
                Object.keys(gData.exp).forEach(key => {
                    if (key.startsWith(filterPrefix)) userXp += gData.exp[key];
                });
            }

            if (userXp > 0 || gData.active) {
                totalRaw += userXp;
                leaderboard.push({ name: user.username, xp: userXp, active: gData.active });
            }
        }

        leaderboard.sort((a, b) => b.xp - a.xp);

        // STRÁNKOVÁNÍ A CACHE ID (DŮLEŽITÁ OPRAVA: Bez podtržítek!)
        const pageSize = 15;
        const totalPages = Math.ceil(leaderboard.length / pageSize) || 1;
        
        // cacheId nesmí obsahovat '_', aby fungoval split v changePage
        const cacheId = `${guildName.slice(0,3)}${period}${filterPrefix || 'all'}${customDate || 'now'}`.replace(/[^a-zA-Z0-9]/g, '');

        const pages = [];
        for (let i = 0; i < leaderboard.length; i += pageSize) {
            const chunk = leaderboard.slice(i, i + pageSize);
            const description = chunk.map((p, index) => {
                const rank = i + index + 1;
                const nameStyle = p.active ? `**${uhg.dontFormat(p.name)}**` : `*${uhg.dontFormat(p.name)}* (left)`;
                return `\`#${rank}\` ${nameStyle}: \`${uhg.f(p.xp)}\``;
            }).join('\n');

            const pageEmbed = new uhg.dc.Embed()
                .setTitle(`${guildName} GEXP - ${titleSuffix}`)
                .setColor(0x55FFFF)
                .setDescription(
                    `**Statistiky:**\n` +
                    `• Scaled EXP: \`${uhg.f(totalScaled)}\`\n` +
                    `• Raw EXP: \`${uhg.f(totalRaw)}\`\n` +
                    `• Efektivita: \`${(uhg.func.ratio(totalScaled, totalRaw) * 100).toFixed(1)}%\`\n\n` +
                    `**Leaderboard:**\n${description || "_Žádná data pro toto období_"}`
                )
                .setFooter({ text: `Strana ${pages.length + 1}/${totalPages} • ${leaderboard.length} hráčů` })
                .setTimestamp();

            pages.push(pageEmbed);
        }

        if (!pages.length) return interaction.editReply("❌ Pro toto období nebyla nalezena žádná data.");

        saveToCache(cacheId, pages);

        const buttons = createButtons(cacheId, pages.length, 0);
        await interaction.editReply({ embeds: [pages[0]], components: [buttons] });
    },

    changePage: async (uhg, interaction) => {
        const parts = interaction.customId.split('_');
        // parts[0] = gexp, parts[1] = changePage, parts[2] = cacheId, parts[3] = action
        const cacheId = parts[2];
        const action = parts[3];

        const data = loadFromCache(cacheId);
        if (!data) return interaction.reply({ content: "❌ Data vypršela. Spusť příkaz znovu.", flags: [MessageFlags.Ephemeral] });

        let currentPage = 0;
        try {
            const footerText = interaction.message.embeds[0].footer.text;
            currentPage = parseInt(footerText.split(' ')[1].split('/')[0]) - 1;
        } catch (e) {}

        let newPage = currentPage;
        if (action === '0') newPage = 0;
        else if (action === 'prev') newPage = Math.max(0, currentPage - 1);
        else if (action === 'next') newPage = Math.min(data.pages.length - 1, currentPage + 1);
        else if (action === 'last') newPage = data.pages.length - 1;

        if (newPage === currentPage) return interaction.deferUpdate();

        const buttons = createButtons(cacheId, data.pages.length, newPage);
        await interaction.update({ embeds: [data.pages[newPage]], components: [buttons] });
    }
};

function createButtons(cacheId, totalPages, currentPage) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_0`).setEmoji('⏮').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_prev`).setEmoji('◀').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_next`).setEmoji('▶').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
        new ButtonBuilder().setCustomId(`gexp_changePage_${cacheId}_last`).setEmoji('⏭').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1)
    );
}

function saveToCache(id, pages) {
    try {
        let cache = {};
        if (fs.existsSync(CACHE_PATH)) cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
        const now = Date.now();
        // Promazání starší než 2 hodiny
        for (const key in cache) { if (cache[key].timestamp < now - 7200000) delete cache[key]; }
        cache[id] = { pages, timestamp: now };
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
    } catch (e) { console.error("Cache Save Error:", e); }
}

function loadFromCache(id) {
    try {
        if (!fs.existsSync(CACHE_PATH)) return null;
        const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
        return cache[id];
    } catch (e) { return null; }
}
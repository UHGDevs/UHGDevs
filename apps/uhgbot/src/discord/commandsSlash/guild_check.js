/**
 * src/discord/commandsSlash/guild_check.js
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: "guild-check",
    description: "Kontrola členů guildy (Unelites / Unverified)",
    permissions: [
        { type: 'ROLE', id: '530504567528620063' }, // GM
        { type: 'ROLE', id: '475585340762226698' }, // GENERAL
        { type: 'ROLE', id: '537252847025127424' }, // MANAGER
        { type: 'ROLE', id: '530504766225383425' }, // OFFICER
        { type: 'USER', id: '378928808989949964' }  // Ty
    ],
    options: [
        {
            name: "type",
            description: "Co chceš zkontrolovat?",
            type: 3,
            required: true,
            choices: [
                { name: 'Unelites (Neaktivní)', value: 'unelites' },
                { name: 'Unverified (Nepropojení)', value: 'unverified' }
            ]
        },
        { name: "days", description: "Počet dní pro Unelites (default: 30)", type: 4, required: false }
    ],

run: async (uhg, interaction) => {
        await interaction.deferReply();
        const type = interaction.options.getString('type');
        const days = interaction.options.getInteger('days') || 30;

        // 1. Získáme UUID aktivních členů
        const activeMembers = await uhg.db.getOnlineMembers("UltimateHypixelGuild");
        
        if (!activeMembers || !activeMembers.length) {
            return interaction.editReply("❌ Chyba: Metoda `getOnlineMembers` nevrátila žádné členy. Zkontroluj, zda máš v DB u hráčů `active: true` v poli `guilds`.");
        }

        if (type === 'unelites') {
            const uuids = activeMembers.map(m => m.uuid);
            // Načteme plná data - OPRAVENO: přidána projekce pro celou složku guilds
            const fullData = await uhg.db.db.collection("users").find(
                { _id: { $in: uuids } },
                { projection: { username: 1, guilds: 1, "stats.general.lastLogin": 1 } }
            ).toArray();

            const embed = generateUnelitesEmbed(uhg, fullData, days);
            return interaction.editReply({ embeds: [embed] });

        } else if (type === 'unverified') {
            const embed = generateUnverifiedEmbed(uhg, activeMembers);
            return interaction.editReply({ embeds: [embed] });
        }
    }
};

function generateUnelitesEmbed(uhg, members, days) {
    const IGNORED_RANKS = ["Guild Master", "Guild Manager", "Guild Officer", "Guild General"];
    
    // Zjistíme nejnovější datum v DB
    const allDates = members.flatMap(m => {
        const g = m.guilds?.find(x => x.name === "UltimateHypixelGuild");
        return g?.exp ? Object.keys(g.exp) : [];
    }).filter(d => d.length === 10);

    const latestDateStr = allDates.sort().reverse()[0] || new Date().toISOString().slice(0, 10);

    const checkDays = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(latestDateStr);
        d.setDate(d.getDate() - i);
        checkDays.push(d.toISOString().slice(0, 10));
    }

    let results = [];
    let staffCount = 0;
    let newCount = 0;
    let noDataCount = 0;

    for (const user of members) {
        // Hledáme záznam UHG v poli guilds
        const g = user.guilds?.find(x => x.name === "UltimateHypixelGuild");
        
        if (!g) { noDataCount++; continue; }
        if (IGNORED_RANKS.includes(g.rank)) { staffCount++; continue; }
        
        // Členství pod 7 dní
        if (g.joined && (Date.now() - Number(g.joined)) < (1000 * 60 * 60 * 24 * 7)) {
            newCount++;
            continue;
        }

        let totalGexp = 0;
        if (g.exp) {
            checkDays.forEach(day => totalGexp += (g.exp[day] || 0));
        }

        const lastLogin = user.stats?.general?.lastLogin || 0;

        results.push({
            name: user.username || user._id,
            gexp: totalGexp,
            joined: g.joined,
            lastLogin: lastLogin
        });
    }

    results.sort((a, b) => a.gexp - b.gexp);
    const top = results.slice(0, 15);

    const description = top.map((u, i) => {
        const joined = u.joined ? `<t:${Math.round(Number(u.joined) / 1000)}:R>` : "`???`";
        const login = u.lastLogin ? `<t:${Math.round(u.lastLogin / 1000)}:R>` : "`API OFF`";
        return `\`${i+1}.\` **${uhg.dontFormat(u.name)}** | ${days}d: \`${uhg.f(u.gexp)}\`\n> Joined: ${joined} • Login: ${login}`;
    }).join('\n');

    const embed = new uhg.dc.Embed()
        .setTitle(`UNELITES - Nejméně GEXP za ${days} dní`)
        .setColor("Red")
        .setDescription(description || "Všichni členové plní limity! 🎉")
        .setFooter({ text: `Dne: ${latestDateStr} | Celkem v seznamu: ${members.length} | Staff: ${staffCount} | Noví: ${newCount} | Chyba dat: ${noDataCount}` });

    return embed;
}

function generateUnverifiedEmbed(uhg, activeMembers) {
    const unverified = activeMembers
        .filter(m => !m.discordId)
        .sort((a, b) => (a.joined || 0) - (b.joined || 0));

    const description = unverified.map(m => {
        const joined = m.joined ? `<t:${Math.round(m.joined / 1000)}:R>` : "`???`";
        return `• **${uhg.dontFormat(m.username || m.uuid)}** (Joined: ${joined})`;
    }).join('\n');

    return new uhg.dc.Embed()
        .setTitle(`UNVERIFIED ČLENOVÉ (${unverified.length})`)
        .setColor("Yellow")
        .setDescription(description || "Všichni členové jsou verifikovaní! 🎉");
}
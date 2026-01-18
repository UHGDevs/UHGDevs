/**
 * src/discord/commandsSlash/guild_check.js
 * Kombinovaný příkaz pro kontrolu guildy (Unelites + Unverified).
 * Používá čerstvá data z API.
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
            description: "Co chceš zobrazit?",
            type: 3, // STRING
            required: true,
            choices: [
                { name: 'Unelites (Neaktivní)', value: 'unelites' },
                { name: 'Unverified (Nepropojení)', value: 'unverified' }
            ]
        },
        {
            name: "days",
            description: "Počet dní pro Unelites (default: 30)",
            type: 4, // INTEGER
            required: false
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();
        const type = interaction.options.getString('type');
        
        // Získání čerstvých členů z API
        const api = await uhg.api.call("64680ee95aeb48ce80eb7aa8626016c7", ["guild"]);
        if (!api.success) return interaction.editReply("❌ Chyba Hypixel API: " + api.reason);
        
        const guildMembersApi = api.guild.all.members;

        if (type === 'unelites') {
            const days = interaction.options.getInteger('days') || 30;
            
            // Načtení historie GEXP z DB
            const guildDataDB = await uhg.db.run.get("stats", "guild", { name: "UltimateHypixelGuild" }).then(res => res[0]);
            
            if (!guildDataDB) return interaction.editReply("❌ Chybí historická data v DB.");

            const embed = await generateUnelitesEmbed(uhg, guildMembersApi, guildDataDB, days);
            await interaction.editReply({ embeds: [embed] });
        
        } else if (type === 'unverified') {
            const embed = await generateUnverifiedEmbed(uhg, guildMembersApi);
            await interaction.editReply({ embeds: [embed] });
        }
    }
};

/**
 * OPTIMALIZOVANÁ funkce pro Unelites
 * Používá MongoDB Projection místo API callů
 */
async function generateUnelitesEmbed(uhg, currentMembers, dbData, days = 30) {
    const IGNORED_RANKS = ["Guild Master", "Guild Manager", "Guild Officer", "Guild General"];
    
    const checkDays = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        checkDays.push(d.toISOString().slice(0, 10));
    }

    let stats = [];

    for (const member of currentMembers) {
        if ((Date.now() - member.joined) / (1000 * 60 * 60 * 24) < 7) continue;
        if (IGNORED_RANKS.includes(member.rank)) continue;

        let sumGexp = 0;
        const dbMember = dbData.members.find(m => m.uuid === member.uuid);
        const dailyHistory = dbMember ? (dbMember.exp.daily || {}) : {}; 

        for (const day of checkDays) sumGexp += dailyHistory[day] || 0;
        
        const name = dbMember ? dbMember.name : member.uuid;

        stats.push({ uuid: member.uuid, name: name, joined: member.joined, gexp: sumGexp });
    }

    stats.sort((a, b) => a.gexp - b.gexp);
    const top = stats.slice(0, 15);

    // --- OPTIMALIZACE: Last Login z DB (Batch Query) ---
    // Místo 15 API callů uděláme jeden dotaz do DB pro všechny UUID
    const uuids = top.map(u => u.uuid);
    
    const dbLogins = await uhg.db.mongo.db("stats").collection("stats").find(
        { uuid: { $in: uuids } },
        { projection: { uuid: 1, lastLogin: 1 } } // Stahujeme jen to, co potřebujeme
    ).toArray();

    // Spárování dat
    for (const u of top) {
        const entry = dbLogins.find(d => d.uuid === u.uuid);
        u.lastLogin = entry ? entry.lastLogin : null;
    }
    // ---------------------------------------------------

    const description = top.map((u, i) => {
        const joined = `<t:${Math.round(u.joined / 1000)}:R>`;
        
        // Logika pro zobrazení
        let login = "`API OFF`"; // Default, pokud je null
        if (u.lastLogin) {
            login = `<t:${Math.round(u.lastLogin / 1000)}:R>`;
        }
        
        return `\`${i+1}.\` **${uhg.dontFormat(u.name)}** | ${days}d: \`${uhg.f(u.gexp)}\`\n> Joined: ${joined} • Login: ${login}`;
    }).join('\n');

    return new uhg.dc.Embed()
        .setTitle(`UNELITES - Nejméně GEXP (${days} dní)`)
        .setDescription(description || "Všichni plní limity! 🎉")
        .setColor("Red")
        .setFooter({ text: "Hráči v guildě < 7 dní + staff jsou ignorováni." })
        .setTimestamp();
}

/**
 * Logika pro Unverified (Beze změny)
 */
async function generateUnverifiedEmbed(uhg, guildMembers) {
    const verifiedUsers = await uhg.db.run.get("general", "verify");
    const verifiedUUIDs = verifiedUsers.map(n => n.uuid);

    const unverifiedMembers = [];

    for (const member of guildMembers) {
        if (!verifiedUUIDs.includes(member.uuid)) {
            let name = member.uuid;
            const statData = await uhg.db.getStats(member.uuid);
            if (statData) name = statData.username;
            
            unverifiedMembers.push({ uuid: member.uuid, name: name, joined: member.joined });
        }
    }

    unverifiedMembers.sort((a, b) => b.joined - a.joined);

    const desc = unverifiedMembers.map(u => {
        return `• **${uhg.dontFormat(u.name)}** (Joined: <t:${Math.round(u.joined/1000)}:R>)`;
    }).join('\n');

    return new uhg.dc.Embed()
        .setTitle(`UNVERIFIED MEMBERS (${unverifiedMembers.length})`)
        .setDescription(desc || "Všichni členové jsou verifikovaní! 🎉")
        .setColor("Yellow")
        .setFooter({ text: "Tito hráči nemají propojený Discord v naší databázi." });
}

module.exports.generateUnelitesEmbed = generateUnelitesEmbed;
module.exports.generateUnverifiedEmbed = generateUnverifiedEmbed;
/**
 * src/time/events/guildinfo.js
 * Kompletní správa guild: Update členů v users, globální statistiky, Discord reporty.
 */
const ApiFunctions = require('../../api/ApiFunctions');
const { generateUnelitesEmbed, generateUnverifiedEmbed } = require('../../discord/commandsSlash/guild_check');

module.exports = {
  name: "guildinfo",
  description: "Update členů v DB, globální statistiky a Discord reporty",
  emoji: '📊',
  time: '0 55 * * * *', 
  onstart: true,
  run: async (uhg) => {
    const now = new Date();
    
    const CHANNELS = {
        members: "811865691908603904",
        uhg_level: "825659339028955196",
        tkjk_level: "928569528676392980",
        diff: "928671490436648980",
        report: "548772550386253824", // Původní report kanál
        admin_weekly: "530496801782890527"
    };

    const TRACKED = [
        { name: "UltimateHypixelGuild", uuid: "64680ee95aeb48ce80eb7aa8626016c7", main: true },
        { name: "TKJK", uuid: "574bfb977d4c475b8197b73b15194a2a", main: false }
    ];

    const statsSummary = {};

    for (const gInfo of TRACKED) {
        const api = await uhg.api.call(gInfo.uuid, ["guild"]);
        if (!api.success || !api.guild.guild) continue;

        const guild = api.guild.all;
        // Získáme nejnovější datum z historie expů (Hypixel den)
        const hpDate = Object.keys(guild.members[0].expHistory).sort().reverse()[0]; 
        const apiMemberUuids = guild.members.map(m => m.uuid);

        // --- 1. VÝPOČET DENNÍHO SCALED GEXP (pro levely) ---
        const d = new Date(hpDate);
        d.setDate(d.getDate() - 1);
        const yestStr = d.toISOString().slice(0, 10);
        
        // Najdeme záznam ze včerejška v kolekci guild_stats
        const lastGS = await uhg.db.findOne("guild_stats", { _id: `${guild.name}-${yestStr}` });
        const dailyScaled = lastGS ? (guild.exp - lastGS.totalExp) : 0;

        // --- 2. UPDATE KOLEKCE guild_stats (Globální historie) ---
        const gStats = {
            guild: guild.name,
            date: hpDate,
            totalExp: guild.exp,
            dailyScaledExp: dailyScaled,
            level: ApiFunctions.getGuildLevel(guild.exp),
            membersCount: guild.members.length,
            updated: Date.now()
        };
        await uhg.db.db.collection("guild_stats").updateOne({ _id: `${guild.name}-${hpDate}` }, { $set: gStats }, { upsert: true });
        statsSummary[guild.name] = gStats;

        // --- 3. BULK UPDATE ČLENŮ V USERS (Individuální historie) ---
        const bulkOps = [];
        for (const m of guild.members) {
            // A) VŽDY: Aktualizujeme jméno v rootu. Pokud hráč v DB není, VYTVOŘÍ SE.
            bulkOps.push({
                updateOne: {
                    filter: { _id: m.uuid },
                    update: { $set: { username: m.name, updated: Date.now() } },
                    upsert: true // Tady vzniká nový dokument, pokud UUID neexistuje
                }
            });

            // B) POKUD CHYBÍ GUILDA: Pokud hráč nemá tuhle guildu v poli, přidáme ji tam (inicializace).
            bulkOps.push({
                updateOne: {
                    filter: { _id: m.uuid, "guilds.name": { $ne: guild.name } },
                    update: { 
                        $push: { guilds: {
                            name: guild.name,
                            active: true,
                            joined: m.joined,
                            rank: m.rank,
                            exp: m.expHistory // Prvotní nahrání historie (7 dní)
                        }}
                    },
                    upsert: false
                }
            });

            // C) POKUD GUILDA EXISTUJE: Aktualizujeme jen konkrétní dny, abychom nesmazali historii.
            const expUpdates = {};
            for (const [date, val] of Object.entries(m.expHistory)) {
                expUpdates[`guilds.$[elem].exp.${date}`] = val;
            }

            bulkOps.push({
                updateOne: {
                    filter: { _id: m.uuid, "guilds.name": guild.name },
                    update: { 
                        $set: { 
                            ...expUpdates,
                            "guilds.$[elem].active": true,
                            "guilds.$[elem].rank": m.rank,
                            "guilds.$[elem].joined": m.joined
                        }
                    },
                    arrayFilters: [{ "elem.name": guild.name }],
                    upsert: false
                }
            });
        }
        if (bulkOps.length) await uhg.db.bulkUpdateUsers(bulkOps);

        // --- 4. DETEKCE ODCHODŮ ---
        await uhg.db.db.collection("users").updateMany(
            { 
                "guilds": { $elemMatch: { name: guild.name, active: true } }, 
                "_id": { $nin: apiMemberUuids } 
            },
            { $set: { "guilds.$[elem].active": false } },
            { arrayFilters: [{ "elem.name": guild.name, "elem.active": true }] }
        );
    }

    // ============================================================
    // DISCORD LOGIKA
    // ============================================================
    
    // A. AKTUALIZACE KANÁLŮ (Názvy kanálů se statistikami)
    if (statsSummary["UltimateHypixelGuild"] && statsSummary["TKJK"]) {
        const u = statsSummary["UltimateHypixelGuild"];
        const t = statsSummary["TKJK"];
        const diff = Math.abs(u.level - t.level);

        const updateName = async (id, name) => {
            const c = uhg.dc.client.channels.cache.get(id);
            if (c && c.name !== name) await c.setName(name).catch(()=>{});
        };

        await updateName(CHANNELS.members, `Members: ${u.membersCount}/125`);
        await updateName(CHANNELS.uhg_level, `UHG Level: ${uhg.f(u.level, 3)}`);
        await updateName(CHANNELS.tkjk_level, `TKJK Level: ${uhg.f(t.level, 3)}`);
        await updateName(CHANNELS.diff, `Rozdíl: ${uhg.f(diff, 4)}`);
    }

    // B. DAILY REPORT (04:55 UTC = 05:55/06:55 v ČR)
    if (now.getUTCHours() === 4) {
        const reportChan = uhg.dc.cache.channels.get('logs'); // Nebo CHANNELS.report
        const hpDate = statsSummary["UltimateHypixelGuild"]?.date;

        if (reportChan && hpDate) {
            const reportId = `REPORT-${hpDate}`;
            const alreadySent = await uhg.db.findOne("guild_stats", { _id: reportId });

            if (!alreadySent && statsSummary["UltimateHypixelGuild"] && statsSummary["TKJK"]) {
                const u = statsSummary["UltimateHypixelGuild"];
                const t = statsSummary["TKJK"];
                
                const d = new Date(hpDate); d.setDate(d.getDate() - 1);
                const yStr = d.toISOString().slice(0, 10);
                
                const oldU = await uhg.db.findOne("guild_stats", { _id: `UltimateHypixelGuild-${yStr}` });
                const oldT = await uhg.db.findOne("guild_stats", { _id: `TKJK-${yStr}` });

                const uGain = oldU ? (u.level - oldU.level) : 0;
                const tGain = oldT ? (t.level - oldT.level) : 0;

                const gap = u.level - t.level;
                const lastGap = (oldU && oldT) ? (oldU.level - oldT.level) : gap;
                const delta = gap - lastGap;

                const embed = new uhg.dc.Embed()
                    .setTitle(`UHG vs TKJK - Denní Report (${hpDate})`)
                    .setColor(delta >= 0 ? "Green" : "Orange")
                    .addFields(
                        { 
                            name: "UltimateHypixelGuild", 
                            value: `Lvl: **${uhg.f(u.level, 5)}** (+${uhg.f(uGain, 6)})\nXP: +${uhg.f(u.dailyScaledExp, 0)}`, 
                            inline: true 
                        },
                        { 
                            name: "TKJK", 
                            value: `Lvl: **${uhg.f(t.level, 5)}** (+${uhg.f(tGain, 6)})\nXP: +${uhg.f(t.dailyScaledExp, 0)}`, 
                            inline: true 
                        },
                        { 
                            name: "Souboj o levely", 
                            value: `Rozdíl: **${uhg.f(gap, 6)}** (${delta >= 0 ? "+" : ""}${uhg.f(delta, 6)})`, 
                            inline: false 
                        }
                    )
                    .setFooter({ text: "Statistiky vygenerovány před denním resetem Hypixelu" })
                    .setTimestamp();

                await reportChan.send({ embeds: [embed] });
                await uhg.db.updateOne("guild_stats", { _id: reportId }, { sent: true });
            }
        }
    }

    // C. WEEKLY REPORT (Neděle 19:55)
    if (now.getDay() === 0 && now.getHours() === 19) {
        const adminChan = uhg.dc.client.channels.cache.get(CHANNELS.admin_weekly);
        if (adminChan) {
            // Sestavení virtuálního objektu pro kompatibilitu se starými funkcemi
            const membersFromDb = await uhg.db.db.collection("users").find(
                { "guilds": { $elemMatch: { name: "UltimateHypixelGuild", active: true } } },
                { projection: { username: 1, guilds: 1, "stats.general.lastLogin": 1, lastLogin: 1 } }
            ).toArray();

            const virtualMembers = membersFromDb.map(m => {
                const g = m.guilds.find(x => x.name === "UltimateHypixelGuild");
                return { 
                    uuid: m._id, 
                    name: m.username, 
                    exp: { daily: g.exp }, 
                    rank: g.rank, 
                    joined: g.joined,
                    stats: m.stats || { general: { lastLogin: m.lastLogin || 0 } } 
                };
            });

            const unelites = await generateUnelitesEmbed(uhg, virtualMembers, 30);
            const unverified = await generateUnverifiedEmbed(uhg, virtualMembers);

            await adminChan.send({ 
                content: "📅 **Týdenní automatická kontrola UHG**", 
                embeds: [unelites, unverified] 
            });
        }
    }
  }
};
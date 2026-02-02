/**
 * src/time/events/guildinfo.js
 * Kompletní správa guild, reportů a statistik bez snapshot kolekce.
 */
const ApiFunctions = require('../../api/ApiFunctions');
const { generateUnelitesEmbed, generateUnverifiedEmbed } = require('../../discord/commandsSlash/guild_check');

module.exports = {
  name: "guildinfo",
  description: "Update členů v DB, statistiky a reporty",
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
        report: "548772550386253824",
        admin_weekly: "530496801782890527"
    };

    const TRACKED = [
        { name: "UltimateHypixelGuild", uuid: "64680ee95aeb48ce80eb7aa8626016c7"},
        { name: "TKJK", uuid: "574bfb977d4c475b8197b73b15194a2a"}
    ];

    const statsSummary = {};

    for (const gInfo of TRACKED) {
        const api = await uhg.api.call(gInfo.uuid, ["guild"]);
        if (!api.success || !api.guild.guild) continue;

        const guild = api.guild.all;
        const hpDate = Object.keys(guild.members[0].expHistory)[0]; 
        const apiMemberUuids = guild.members.map(m => m.uuid);

        // 1. SCALED XP VÝPOČET (přes guild_stats)
        const d = new Date(hpDate);
        d.setDate(d.getDate() - 1);
        const yestStr = d.toISOString().slice(0, 10);
        const lastGS = await uhg.db.findOne("guild_stats", { _id: `${guild.name}-${yestStr}` });
        const dailyScaled = lastGS ? (guild.exp - lastGS.totalExp) : 0;
        //console.log(`[DEBUG GEXP] ${guild.name} | Today: ${hpDate} | Yest: ${yestStr} | LastTotal: ${lastGS?.totalExp} | CurrTotal: ${guild.exp} | Diff: ${dailyScaled}`);

        // 2. UPDATE guild_stats
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

        // 3. BULK UPDATE ČLENŮ V USERS
        const bulkOps = [];
        for (const m of guild.members) {
            bulkOps.push({
                updateOne: {
                    filter: { _id: m.uuid },
                    update: { 
                        $pull: { guilds: { name: guild.name } }
                    }
                }
            });
            bulkOps.push({
                updateOne: {
                    filter: { _id: m.uuid },
                    update: { 
                        $push: { guilds: {
                            name: guild.name,
                            active: true,
                            joined: m.joined,
                            rank: m.rank,
                            exp: m.expHistory,
                            left: null
                        }},
                        $set: { updated: Date.now() }
                    },
                    upsert: true
                }
            });
        }
        if (bulkOps.length) await uhg.db.bulkUpdateUsers(bulkOps);

        // 4. DETEKCE ODCHODŮ
        await uhg.db.db.collection("users").updateMany(
            { "guilds": { $elemMatch: { name: guild.name, active: true } }, "_id": { $nin: apiMemberUuids } },
            { $set: { "guilds.$[elem].active": false, "guilds.$[elem].left": Date.now() } },
            { arrayFilters: [{ "elem.name": guild.name, "elem.active": true }] }
        );
    }

    // ============================================================
    // DISCORD LOGIKA (Kanály a Reporty)
    // ============================================================
    
    // A. Update Názvů Kanálů
    if (statsSummary["UltimateHypixelGuild"] && statsSummary["TKJK"]) {
        const u = statsSummary["UltimateHypixelGuild"];
        const t = statsSummary["TKJK"];
        const diff = Math.abs(u.level - t.level);

        const update = async (id, name) => {
            const c = uhg.dc.client.channels.cache.get(id);
            if (c && c.name !== name) await c.setName(name).catch(()=>{});
        };

        await update(CHANNELS.members, `Members: ${u.membersCount}/125`);
        await update(CHANNELS.uhg_level, `UHG Level: ${uhg.f(u.level, 3)}`);
        await update(CHANNELS.tkjk_level, `TKJK Level: ${uhg.f(t.level, 3)}`);
        await update(CHANNELS.diff, `Rozdíl: ${uhg.f(diff, 4)}`);
    }

    // B. Daily Report (05:55)
    if (now.getHours() === 5) {
        const reportChan = uhg.dc.cache.channels.get('logs')
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
                        { name: "UHG", value: `Lvl: **${uhg.f(u.level, 5)}** (+${uhg.f(uGain, 5)})\nXP: +${uhg.f(u.dailyScaledExp)}`, inline: true },
                        { name: "TKJK", value: `Lvl: **${uhg.f(t.level, 5)}** (+${uhg.f(tGain, 5)})\nXP: +${uhg.f(t.dailyScaledExp)}`, inline: true },
                        { name: "Trend", value: `Rozdíl: **${uhg.f(gap, 6)}** (${delta >= 0 ? "+" : ""}${uhg.f(delta, 5)})`, inline: false }
                    );
                await reportChan.send({ embeds: [embed] });
                await uhg.db.updateOne("guild_stats", { _id: reportId }, { sent: true });
            }
        }
    }

    // C. Weekly Report (Neděle 19:55)
    if (now.getDay() === 0 && now.getHours() === 19) {
        const adminChan = uhg.dc.client.channels.cache.get(CHANNELS.admin_weekly);
        if (adminChan) {
            // 1. Načteme členy (projekcí vytáhneme jen jméno, guildu a potřebný lastLogin ze stats)
            const membersFromDb = await uhg.db.db.collection("users").find(
                { "guilds": { $elemMatch: { name: "UltimateHypixelGuild", active: true } } },
                { projection: { username: 1, guilds: 1, "stats.general.lastLogin": 1 } }
            ).toArray();

            // 2. Sestavení virtuálního objektu pro generateUnelitesEmbed
            const virtualGuild = {
                name: "UltimateHypixelGuild",
                members: membersFromDb.map(m => {
                    const g = m.guilds.find(x => x.name === "UltimateHypixelGuild");
                    return { 
                        uuid: m._id, 
                        name: m.username, 
                        exp: { daily: g.exp }, 
                        rank: g.rank, 
                        joined: g.joined,
                        // DŮLEŽITÉ: Přidáme stats objekt, aby v něm funkce v guild_check.js našla lastLogin
                        stats: m.stats 
                    };
                })
            };

            // 3. Spuštění funkcí z guild_check.js
            const unelites = await generateUnelitesEmbed(uhg, virtualGuild.members, 30);
            const unverified = await generateUnverifiedEmbed(uhg, virtualGuild.members);

            await adminChan.send({ 
                content: "📅 **Týdenní automatická kontrola UHG**", 
                embeds: [unelites, unverified] 
            });
        }
    }
  }
};
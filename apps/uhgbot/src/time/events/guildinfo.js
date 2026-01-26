/**
 * src/time/events/guildinfo.js
 */
const ApiFunctions = require('../../api/ApiFunctions');
// Import pomocných funkcí z příkazu (abychom nepsali logiku 2x)
const { generateUnelitesEmbed, generateUnverifiedEmbed } = require('../../discord/commandsSlash/guild_check');

module.exports = {
  name: "guildinfo",
  description: "Update DB, Kanály, Denní Reporty a Týdenní Check",
  emoji: '📊',
  time: '0 50 * * * *', 
  onstart: true,
  run: async (uhg) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    
    const CHANNELS = {
        members: "811865691908603904",
        uhg_level: "825659339028955196",
        tkjk_level: "928569528676392980",
        diff: "928671490436648980",
        report: "548772550386253824",
        admin_weekly: "530496801782890527"
    };

    try {
        const uhgApi = await uhg.api.call("64680ee95aeb48ce80eb7aa8626016c7", ["guild"]);
        const tkjkApi = await uhg.api.call("574bfb977d4c475b8197b73b15194a2a", ["guild"]);

        if (!uhgApi.success || !uhgApi.guild.guild) throw new Error("API Error");

        const hypixelDateKey = Object.keys(uhgApi.guild.all.members[0].expHistory)[0];
        
        // DB UPDATE (Důležité: uhgData obsahuje historii a aktuální členy)
        const uhgData = await updateGuildDB(uhg, uhgApi.guild.all);
        const tkjkData = await updateGuildDB(uhg, tkjkApi.guild.all);
        const tkjkG = tkjkApi.guild.all || { exp: 0 };

        // UPDATE KANÁLŮ
        const uhgLvl = ApiFunctions.getGuildLevel(uhgData.totalxp);
        const tkjkLvl = ApiFunctions.getGuildLevel(tkjkG.exp);
        const diff = Math.abs(uhgLvl - tkjkLvl);

        const updateName = async (id, name) => {
            const chan = uhg.dc.client.channels.cache.get(id);
            if (chan && chan.name !== name) await chan.setName(name).catch(() => {});
        };

        await updateName(CHANNELS.members, `Members: ${uhgData.members.length}/125`);
        await updateName(CHANNELS.uhg_level, `Guild Level: ${uhg.f(uhgLvl)}`);
        await updateName(CHANNELS.tkjk, `TKJK: ${uhg.f(tkjkLvl)}`);
        await updateName(CHANNELS.diff, `Rozdíl: ${uhg.f(diff, 5)}`);

        if (now.getHours() === 4 && now.getMinutes() >= 50) {
             const todayKey = dateStr;
             const todayGexp = uhgData.dailyxp[hypixelDateKey] || 0;
             let tkjkDaily = 0;
             const tkjkOld = await uhg.db.run.get("stats", "guild_daily", { name: "TKJK" });
             if (tkjkOld.length) {
                 const last = tkjkOld.sort((a,b) => b.timestamp - a.timestamp)[0];
                 tkjkDaily = tkjkG.exp - last.exp;
             }
             const reportEmbed = new uhg.dc.Embed()
                 .setTitle(`UHG vs TKJK - Denní Report (${hypixelDateKey})`)
                 .setColor(todayGexp > tkjkDaily ? "Green" : "Orange")
                 .addFields(
                     { name: "UHG", value: `Lvl: **${uhg.f(uhgLvl, 3)}**\n+${uhg.f(todayGexp)} XP`, inline: true },
                     { name: "TKJK", value: `Lvl: **${uhg.f(tkjkLvl, 3)}**\n+${uhg.f(tkjkDaily)} XP`, inline: true },
                     { name: "Rozdíl", value: `**${uhg.f(diff, 4)}**`, inline: false }
                 ).setTimestamp();
             
             const reportChan = uhg.dc.client.channels.cache.get(CHANNELS.report);
             const alreadySent = await uhg.db.run.get("stats", "guild_daily", { _id: hypixelDateKey });
             if (reportChan && alreadySent.length === 0) {
                 reportChan.send({ embeds: [reportEmbed] });
                 await uhg.db.run.update("stats", "guild_daily", { _id: hypixelDateKey }, { _id: hypixelDateKey, name: "UHG", exp: uhgData.totalxp, level: uhgLvl, timestamp: Date.now() });
                 await uhg.db.run.update("stats", "guild_daily", { _id: hypixelDateKey + "_tkjk" }, { _id: hypixelDateKey + "_tkjk", name: "TKJK", exp: tkjkG.exp, level: tkjkLvl, timestamp: Date.now() });
             }
        }

        // B. TÝDENNÍ REPORT (Neděle 20:00 - 20:05)
        // Používáme DB data (uhgData), abychom šetřili API
        if (now.getDay() === 0 && now.getHours() === 19 && now.getMinutes() >= 50) {
            const adminChan = uhg.dc.client.channels.cache.get(CHANNELS.admin_weekly);
            if (adminChan) {
                console.log(" [TIME] Odesílám týdenní reporty...".green);
                
                // 1. Unelites (využíváme DB historii z updateGuildDB)
                // Předáváme uhgData.members, což jsou "current" members ale s historií z DB
                const unelitesEmbed = await generateUnelitesEmbed(uhg, uhgData.members, uhgData, 30);
                
                // 2. Unverified
                const unverifiedEmbed = await generateUnverifiedEmbed(uhg, uhgData.members);

                await adminChan.send({ content: "📅 **Týdenní kontrola Guildy**", embeds: [unelitesEmbed, unverifiedEmbed] });
            }
        }

    } catch (e) { throw e; }
  }
};


async function updateGuildDB(uhg, apiGuild) {
    const today = Object.keys(apiGuild.members[0].expHistory)[0]; 
    const yesterday = Object.keys(apiGuild.members[0].expHistory)[1];

    let dbGuild = await uhg.db.run.get("stats", "guild", { _id: apiGuild._id }).then(res => res[0]);

    if (!dbGuild) {
        dbGuild = {
            _id: apiGuild._id, name: apiGuild.name, members: [], left: [],
            tdailyxp: {}, dailyxp: {}, raw_dailyxp: {}
        };
    }

    dbGuild.updated = Date.now();
    dbGuild.totalxp = apiGuild.exp;
    dbGuild.tdailyxp = { ...dbGuild.tdailyxp, [today]: apiGuild.exp };
    
    if (dbGuild.tdailyxp[yesterday]) {
        dbGuild.dailyxp = { ...dbGuild.dailyxp, [today]: apiGuild.exp - dbGuild.tdailyxp[yesterday] };
    } else {
        dbGuild.dailyxp[today] = 0; 
    }

    let todayRawSum = 0;
    const currentUUIDs = [];

    for (const apiMember of apiGuild.members) {
        currentUUIDs.push(apiMember.uuid);
        
        let dbMemberIndex = dbGuild.members.findIndex(m => m.uuid === apiMember.uuid);
        let oldHistory = {};
        let dbMemberName = null;

        if (dbMemberIndex >= 0) {
            oldHistory = dbGuild.members[dbMemberIndex].exp.daily || {};
            dbMemberName = dbGuild.members[dbMemberIndex].name;
        } else {
            const leftIndex = dbGuild.left.findIndex(m => m.uuid === apiMember.uuid);
            if (leftIndex >= 0) {
                oldHistory = dbGuild.left[leftIndex].exp.daily || {};
                dbMemberName = dbGuild.left[leftIndex].name;
                dbGuild.left.splice(leftIndex, 1);
            }
        }

        if (!dbMemberName) {
            const verified = await uhg.db.getVerify(apiMember.uuid);
            dbMemberName = verified ? verified.nickname : apiMember.uuid;
        }

        todayRawSum += apiMember.expHistory[today] || 0;
        const mergedHistory = { ...oldHistory, ...apiMember.expHistory };

        const memberObj = {
            uuid: apiMember.uuid, name: dbMemberName, joined: apiMember.joined,
            questParticipation: apiMember.questParticipation, rank: apiMember.rank,
            exp: { daily: mergedHistory }
        };

        if (dbMemberIndex >= 0) dbGuild.members[dbMemberIndex] = memberObj;
        else dbGuild.members.push(memberObj);
    }

    if (!dbGuild.raw_dailyxp) dbGuild.raw_dailyxp = {};
    dbGuild.raw_dailyxp[today] = todayRawSum;

    for (let i = dbGuild.members.length - 1; i >= 0; i--) {
        if (!currentUUIDs.includes(dbGuild.members[i].uuid)) {
            dbGuild.left.push(dbGuild.members[i]);
            dbGuild.members.splice(i, 1);
        }
    }

    await uhg.db.run.update("stats", "guild", { _id: dbGuild._id }, dbGuild);
    return dbGuild;
}
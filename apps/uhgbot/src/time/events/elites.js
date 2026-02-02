/**
 * src/time/events/elites.js
 * Automatická správa ranků Elite Member na základě týdenního GEXP.
 * Běží každé pondělí v 04:55 (těsně před týdenním resetem).
 */

module.exports = {
  name: "elites",
  description: "Výpočet 10 nejlepších členů v GEXP a jejich automatické povýšení",
  emoji: '👨‍🦼',
  time: '0 55 4 * * 1', // Pondělí 4:55 ráno
  onstart: false,
  run: async (uhg) => {
    const adminChannel = uhg.dc.client.channels.cache.get("530496801782890527");
    const guildChannel = uhg.dc.client.channels.cache.get("715989905532256346");

    try {
      // 1. ZÍSKÁNÍ ŽIVÝCH DAT Z HYPIXEL API (UHG)
      const api = await uhg.api.call("64680ee95aeb48ce80eb7aa8626016c7", ["guild"]);
      if (!api.success || !api.guild.guild) throw new Error(`API Error: ${api.reason}`);

      const members = api.guild.all.members;
      let memberStats = [];

      // 2. VÝPOČET TÝDENNÍHO GEXP Z API DAT
      for (const m of members) {
        const weeklyExp = Object.values(m.expHistory).reduce((a, b) => a + b, 0);
        memberStats.push({
          uuid: m.uuid,
          rank: m.rank,
          exp: weeklyExp
        });
      }

      // 3. VÝBĚR TOP 10 (Pouze z ranků Member a Elite Member)
      const eligibleRanks = ["Member", "Elite Member"];
      const sorted = memberStats
        .filter(m => eligibleRanks.includes(m.rank))
        .sort((a, b) => b.exp - a.exp);

      const top10 = sorted.slice(0, 10);
      const top10Uuids = top10.map(m => m.uuid);

      // 4. ZÍSKÁNÍ JMÉN Z DATABÁZE (Hromadně - 1 dotaz místo 10 API callů)
      const dbUsers = await uhg.db.find("users", { _id: { $in: top10Uuids } }, { projection: { username: 1 } });
      const getName = (uuid) => {
          const u = dbUsers.find(user => user._id === uuid);
          return u ? u.username : uuid; // Fallback na UUID, kdyby náhodou nebyl v DB
      };

      // 5. IDENTIFIKACE ZMĚN
      let promoteList = [];
      let demoteList = [];

      // Kdo má být povýšen
      for (const elite of top10) {
        if (elite.rank === "Member") promoteList.push(getName(elite.uuid));
      }

      // Kdo má být degradován (je Elite, ale vypadl z TOP 10)
      const currentElites = memberStats.filter(m => m.rank === "Elite Member");
      for (const oldElite of currentElites) {
        if (!top10Uuids.includes(oldElite.uuid)) demoteList.push(getName(oldElite.uuid));
      }

      // 6. ODESLÁNÍ PŘÍKAZŮ DO HRY
      if (uhg.mc.ready) {
        for (const nick of promoteList) {
          uhg.minecraft.send(`/g promote ${nick}`);
          await uhg.delay(2000);
        }
        for (const nick of demoteList) {
          uhg.minecraft.send(`/g demote ${nick}`);
          await uhg.delay(2000);
        }
      }

      // 7. OZNÁMENÍ NA DISCORD

      const publicEmbed = new uhg.dc.Embed()
        .setTitle("🏆 Elite Members - Top 10 GEXP")
        .setColor("Gold")
        .setDescription(top10.map((m, i) => {
            const name = getName(m.uuid);
            const icon = i === 0 ? "🥇" : (i === 1 ? "🥈" : (i === 2 ? "🥉" : `\`#${i+1}\``));
            return `${icon} **${uhg.dontFormat(name)}** - ${uhg.f(m.exp)}`;
        }).join('\n'))
        .setTimestamp();

      if (guildChannel) guildChannel.send({ embeds: [publicEmbed] });


      const embed = new uhg.dc.Embed()
        .setTitle("ELITE MEMBERS - Nový týden")
        .setColor("Gold")
        .setDescription("**10 nejlepších hráčů v GEXP za tento týden:**\n\n" + 
            top10.map((m, i) => `\`#${i+1}\` **${uhg.dontFormat(getName(m.uuid))}** - ${uhg.f(m.exp)}`).join('\n')
        )
        .setTimestamp();

      if (promoteList.length || demoteList.length) {
          let changes = "";
          if (promoteList.length) changes += `✅ **Promote:** ${promoteList.join(', ')}\n`;
          if (demoteList.length) changes += `❌ **Demote:** ${demoteList.join(', ')}`;
          embed.addFields({ name: "Změny v rankech", value: changes || "Žádné změny" });
      }

      if (!uhg.mc.ready && (promoteList.length || demoteList.length)) {
          embed.setFooter({ text: "⚠️ Bot je offline, ranky nebyly změněny ve hře!" });
          if (adminChannel) adminChannel.send(`⚠️ **ELITES:** Bot je offline. Proveď změny ručně:\n${promoteList.map(n => `/g promote ${n}`).join('\n')}\n${demoteList.map(n => `/g demote ${n}`).join('\n')}`);
      }

      uhg.dc.cache.channels.get('logs').send({embeds: [embed]})

    } catch (e) {
      console.error(" [ELITES ERROR] ".bgRed, e);
      if (adminChannel) adminChannel.send(`❌ **Chyba v Elites Eventu:** ${e.message}`);
    }
  }
};
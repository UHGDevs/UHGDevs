/**
 * src/time/events/elites.js
 * Automatická správa ranků Elite Member na základě týdenního GEXP.
 */

module.exports = {
  name: "elites",
  description: "Výpočet 10 nejlepších členů v GEXP a jejich automatické povýšení",
  emoji: '👨‍🦼',
  time: '0 55 4 * * 1',
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: false,
  run: async (uhg) => {
    const ADMIN_CHANNEL_ID = '530496801782890527';
    const adminChannel = uhg.dc.client.channels.cache.get(ADMIN_CHANNEL_ID);

    try {
      // 1. ZÍSKÁNÍ DAT O GUILDĚ (UHG)
      const api = await uhg.api.call("64680ee95aeb48ce80eb7aa8626016c7", ["guild"]);
      if (!api.success || !api.guild.guild) {
          throw new Error(`Nepodařilo se načíst guildu: ${api.reason}`);
      }

      const members = api.guild.all.members;
      let memberStats = [];

      // 2. VÝPOČET TÝDENNÍHO GEXP
      for (const member of members) {
        const weeklyExp = Object.values(member.expHistory).reduce((a, b) => a + b, 0);
        memberStats.push({
          uuid: member.uuid,
          rank: member.rank,
          exp: weeklyExp
        });
      }

      // 3. VYBÍRÁME TOP 10 (Hráči s rankem Member nebo Elite Member)
      const eligibleRanks = ["Member", "Elite Member"];
      const sorted = memberStats
        .filter(m => eligibleRanks.includes(m.rank))
        .sort((a, b) => b.exp - a.exp);

      const top10 = sorted.slice(0, 10);
      const top10Uuids = top10.map(m => m.uuid);

      // 4. IDENTIFIKACE ZMĚN (Kdo promote / Kdo demote)
      let promoteList = [];
      let demoteList = [];

      // A. Kdo má být povýšen (je Member, ale patří do TOP 10)
      for (const elite of top10) {
        if (elite.rank === "Member") {
          const info = await uhg.api.getMojang(elite.uuid);
          promoteList.push(info.username);
        }
      }

      // B. Kdo má být degradován (je Elite, ale už není v TOP 10)
      const currentElites = memberStats.filter(m => m.rank === "Elite Member");
      for (const oldElite of currentElites) {
        if (!top10Uuids.includes(oldElite.uuid)) {
          const info = await uhg.api.getMojang(oldElite.uuid);
          demoteList.push(info.username);
        }
      }

      // 5. SESTAVENÍ FINÁLNÍHO EMBEDU PRO GUILD KANÁL
      const embed = new uhg.dc.Embed()
        .setTitle("ELITE MEMBERS - Nový týden")
        .setColor("Gold")
        .setTimestamp();

      let summary = "**10 nejlepších hráčů v GEXP za tento týden:**\n\n";
      for (let i = 0; i < top10.length; i++) {
        const playerInfo = await uhg.api.getMojang(top10[i].uuid);
        summary += `\`#${i+1}\` **${playerInfo.username}** - ${uhg.f(top10[i].exp)}\n`;
      }
      embed.setDescription(summary);

      // 6. PROVEDENÍ AKCÍ (Přímo v MC nebo zprávou na DC)
      if (uhg.mc.ready) {
        // BOT JE ONLINE - pošle příkazy jeden po druhém
        for (const nick of promoteList) {
          uhg.minecraft.send(`/g promote ${nick}`);
          await uhg.delay(2000);
        }
        for (const nick of demoteList) {
          uhg.minecraft.send(`/g demote ${nick}`);
          await uhg.delay(2000);
        }
      } else {
        // BOT JE OFFLINE - pošle seznam příkazů adminům k ručnímu vyřízení
        if (adminChannel && (promoteList.length > 0 || demoteList.length > 0)) {
          let adminMsg = "⚠️ **Bot je offline! Proveď změny ranků ručně:**\n\n";
          if (promoteList.length > 0) adminMsg += `**Promote:**\n\`${promoteList.map(n => `/g promote ${n}`).join('\n')}\`\n\n`;
          if (demoteList.length > 0) adminMsg += `**Demote:**\n\`${demoteList.map(n => `/g demote ${n}`).join('\n')}\``;
          
          adminChannel.send(adminMsg);
        }
        embed.setFooter({ text: "⚠️ Ranky nebyly automaticky změněny (Bot offline)." });
      }

      // Pošleme hlavní oznámení do guild kanálu
      uhg.dc.client.channels.cache.get("715989905532256346")?.send({ embeds: [embed] });

    } catch (e) {
      console.error(" [ELITES ERROR] ".bgRed, e);
      // Informování adminů o chybě
      if (adminChannel) {
        adminChannel.send({
          embeds: [new uhg.dc.Embed()
            .setTitle("❌ Chyba v Elites Eventu")
            .setColor("Red")
            .setDescription(`\`\`\`${e.message}\`\`\``)
            .setTimestamp()
          ]
        });
      }
    }
  }
};
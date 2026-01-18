/**
 * src/time/events/achievements.js
 * Automatické stahování a aktualizace seznamu achievementů z Hypixel API.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "achievements",
  description: "Aktualizace seznamu achievementů a přepočet Legacy AP definic",
  emoji: '💎',
  time: '0 0 5 * * *', // Každý den v 5:00 ráno
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true, // Spustit i při startu bota
  run: async (uhg) => {
    const logsChannel = uhg.dc.cache.channels.get('logs');
    const devChannel = uhg.dc.cache.channels.get('bot');
    const apsPath = path.resolve(__dirname, '../../api/constants/achievements.json');

    console.log(` [ACHIEVEMENTS] `.bgMagenta.black + ` Stahuji aktuální zdroje achievementů...`.magenta);

    // 1. STÁHNUTÍ DAT Z HYPIXELU (Resources endpoint nepotřebuje API klíč, ale je lepší ho poslat)
    const res = await axios.get('https://api.hypixel.net/resources/achievements');
    if (!res.data.success) throw new Error("Nepodařilo se stáhnout achievementy z Hypixelu.");

    const allAchievements = res.data.achievements;

    // 2. FILTROVÁNÍ LEGACY ACHIEVEMENTŮ
    // Použijeme tvou existující utilitu src/api/achievements.js
    const achUtils = require('../../api/achievements');
    const legacyMap = await achUtils.getLegacy(uhg, allAchievements);

    const finalJson = {
      all: allAchievements,
      legacy: legacyMap,
      updated: Date.now(),
      updated_formatted: new Date().toLocaleString('cs-CZ')
    };

    // 3. ULOŽENÍ DO SOUBORU
    fs.writeFileSync(apsPath, JSON.stringify(finalJson, null, 4));

    // 4. AKTUALIZACE DAT V RAM (Aby bot hned věděl o změnách)
    uhg.aps = finalJson;

    console.log(` [ACHIEVEMENTS] `.bgGreen.black + ` Hotovo. Legacy kategorie aktualizována.`.green);

    // 5. INFORMOVÁNÍ MANAŽERŮ
    if (logsChannel) {
        logsChannel.send({
            embeds: [new uhg.dc.Embed()
                .setTitle("Achievementy aktualizovány")
                .setColor("LuminousVividPink")
                .setDescription("Bot úspěšně stáhl nejnovější seznam achievementů a aktualizoval Legacy definice.")
                .setFooter({ text: `Další kontrola zítra v 5:00` })
                .setTimestamp()
            ]
        });
    }
  }
};
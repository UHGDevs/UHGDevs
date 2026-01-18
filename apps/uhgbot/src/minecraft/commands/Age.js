/**
 * src/minecraft/commands/Age.js
 * Zobrazí datum vytvoření Minecraft účtu.
 */

module.exports = {
  name: "Age",
  aliases: ["age", "og", "created"],
  run: async (uhg, pmsg) => {
    try {
      // 1. Získání dat z API
      // Pro datum vytvoření stačí volat 'mojang' (v našem call() je to defaultní identita)
      let api = await uhg.api.call(pmsg.nickname, ["mojang"]);
      if (!api.success) return api.reason;

      // 2. Kontrola, zda máme datum (některé velmi staré účty ho nemusí v API mít)
      if (!api.date || isNaN(api.date.getTime()) || api.date.getTime() === 0) {
        return `Nepodařilo se zjistit datum vytvoření účtu pro ${api.username}.`;
      }

      const timestamp = Math.round(api.date.getTime() / 1000);
      const den = api.date.getDate();
      const mesic = api.date.getMonth() + 1;
      const rok = api.date.getFullYear();

      let mcMessage = `**${api.username}** - Účet vytvořen: ${den}. ${mesic}. ${rok}`;

      let dcEmbed = new uhg.dc.Embed()
        .setTitle('Minecraft Account Age')
        .setThumbnail('https://cdn.discordapp.com/attachments/875503798733385779/1015701045600604260/unknown.png')
        .setColor(0x06ACEE)
        .addFields(
            { name: "Hráč", value: uhg.dontFormat(api.username), inline: true },
            { name: "Datum vytvoření", value: `<t:${timestamp}:D>`, inline: true },
            { name: "Relativně", value: `<t:${timestamp}:R>`, inline: true }
        );

      if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

      return { mc: mcMessage, dc: dcEmbed };

    } catch (e) {
        console.error(` [ERROR] MC Command Age: `.red, e);
        return "Chyba v Age příkazu!";
    }
  }
}
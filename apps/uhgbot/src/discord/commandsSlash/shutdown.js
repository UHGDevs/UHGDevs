/**
 * src/discord/commandsSlash/shutdown.js
 * Bezpečné vypnutí bota s potvrzovacím tlačítkem.
 * POZOR: Vyžaduje externí proces (PM2/Docker), který bota znovu zapne!
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: "shutdown",
    description: "Vypne proces bota (Restart vyžaduje externí autostart)",
    permissions: [
        { type: 'USER', id: '378928808989949964' }, // DavidCzPdy
        { type: 'USER', id: '312861502073995265' }  // Farmans
    ],
    options: [],

    // 1. ZOBRAZENÍ POTVRZENÍ
    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const embed = new uhg.dc.Embed()
            .setTitle("⚠️ Vyžádáno vypnutí systému")
            .setColor("Red")
            .setDescription(
                "Opravdu chceš vypnout bota?\n\n" +
                "**Poznámka:** Toto ukončí proces `node`. Pokud nemáš nastavený auto-restart (PM2, Docker), bot zůstane vypnutý."
            );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("shutdown_confirm") // Volá metodu confirm()
                .setLabel("Vypnout / Restartovat")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🔌"),
            new ButtonBuilder()
                .setCustomId("shutdown_cancel") // Volá metodu cancel()
                .setLabel("Zrušit")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({ embeds: [embed], components: [buttons] });
    },

    // 2. POTVRZENÍ A VYPNUTÍ
    confirm: async (uhg, interaction) => {
        // Nejdřív odpovíme, aby interakce neselhala
        await interaction.update({ 
            content: "🛑 **Vypínám systém...** (Na hostingu by měl naskočit za pár sekund)", 
            embeds: [], 
            components: [] 
        });

        console.log(` [SYSTEM] `.bgRed.white + ` Shutdown vyvolán uživatelem ${interaction.user.username}`.red);

        // Odeslání logu do bot kanálu před smrtí
        const logChannel = uhg.dc.cache.channels.get('bot');
        if (logChannel) {
            await logChannel.send(`🔌 **SHUTDOWN:** Příkaz vyvolal ${interaction.user}`).catch(() => {});
        }

        // Ukončení spojení s MC a DB (Slušné chování)
        if (uhg.mc.client) uhg.mc.client.quit();
        if (uhg.db.mongo) await uhg.db.mongo.close();

        // Kill process
        // Kód 0 = OK, Kód 1 = Error (zde je to chtěné ukončení, takže 0)
        process.exit(0);
    },

    // 3. ZRUŠENÍ AKCE
    cancel: async (uhg, interaction) => {
        await interaction.update({ 
            content: "✅ Vypnutí zrušeno.", 
            embeds: [], 
            components: [] 
        });
    }
};
/**
 * src/discord/commandsSlash/customroles.js
 * Samopodpisovací role (Reaction Roles) přes tlačítka.
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: 'customroles',
    description: 'Odeslat panel pro výběr rolí (Admin pouze)',
    // Oprávnění pro spuštění příkazu (vytvoření panelu)
    permissions: [
        { type: 'USER', id: '378928808989949964' }, // DavidCzPdy
        { type: 'USER', id: '312861502073995265' }  // Farmans
    ],

    /**
     * 1. ODESLÁNÍ PANELU
     * Spustí se při napsání /customroles
     */
    run: async (uhg, interaction) => {
        // Použití Flags místo ephemeral:true (Discord.js v14 standard)
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const embed = new uhg.dc.Embed()
            .setTitle("**UHG Reaction Roles**")
            .setColor(0x55FFFF)
            .setDescription(
                "Vyber si role, o které máš zájem. Kliknutím na tlačítko si roli přidáš nebo odebereš.\n\n" +
                "**🔔 Oznámení (Pings)**\n" +
                "<:discord:1003709661335277569> ➜ <@&1003713161238679652> (Discord Novinky)\n" +
                "<:saturn:1012080877242687500> ➜ <@&1003713511710543952> (SkyBlock Novinky)\n" +
                "<:games:1003709662941675541> ➜ <@&1003713647845052466> (Hypixel Novinky)"
            )
            .setFooter({ text: "Pokud tlačítka nereagují, kontaktuj technickou správu." });

        // První řada - Oznámení
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('customroles_toggle_1003713161238679652')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:discord:1003709661335277569>'),
            new ButtonBuilder()
                .setCustomId('customroles_toggle_1003713511710543952')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:saturn:1012080877242687500>'),
            new ButtonBuilder()
                .setCustomId('customroles_toggle_1003713647845052466')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:games:1003709662941675541>')
        );



        // Odeslání do kanálu, kde byl příkaz napsán
        await interaction.channel.send({ embeds: [embed], components: [row1] });
        await interaction.editReply({ content: "✅ Panel s rolemi byl úspěšně odeslán do tohoto kanálu." });
    },

    /**
     * 2. LOGIKA PŘEPÍNÁNÍ ROLÍ
     * Voláno automaticky přes interactionCreate.js (díky customId začínajícímu na customroles_toggle_)
     */
    toggle: async (uhg, interaction) => {
        // ID role je třetí část ID tlačítka: customroles_toggle_123456...
        const roleId = interaction.customId.split('_')[2];
        const member = interaction.member;
        const guild = interaction.guild;

        if (!guild) return;

        // Najdeme roli na serveru
        const role = guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({ content: "❌ Tato role nebyla na serveru nalezena.", flags: [MessageFlags.Ephemeral] });
        }

        try {
            // Kontrola, zda uživatel roli má
            if (member.roles.cache.has(roleId)) {
                // ODEBRAT ROLI
                await member.roles.remove(role);
                await interaction.reply({ 
                    content: `🗑️ Role **${role.name}** ti byla odebrána.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            } else {
                // PŘIDAT ROLI
                await member.roles.add(role);
                await interaction.reply({ 
                    content: `✅ Role **${role.name}** ti byla přidána.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        } catch (e) {
            console.error(` [ROLES ERROR] Chyba přiřazení role: `.red, e.message);
            await interaction.reply({ 
                content: "❌ Nepodařilo se změnit roli. Ujisti se, že bot má dostatečná oprávnění (Role bota musí být nad těmito rolemi).", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }
};
/**
 * src/discord/commandsSlash/customroles.js
 * Menu pro výběr volitelných rolí (Pingy, Movie Night atd.)
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: 'customroles',
    description: 'Vyvolá menu pro výběr Custom Rolí (Admin)',
    permissions: [
        { type: 'USER', id: '378928808989949964' }, // DavidCzPdy
        { type: 'USER', id: '312861502073995265' }  // Farmans
    ],

    // --- 1. ODESLÁNÍ PANELU (Admin only) ---
    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const embed = new uhg.dc.Embed()
            .setTitle("**Reaction Role**")
            .setColor(0x55FFFF)
            .setDescription(
                "<:dot:1109460785723351110> **Ping Role**\n" +
                "Tyto role slouží k tomu, abyste byli upozorněni na konkrétní novinky:\n\n" +
                "<:discord:1003709661335277569> ➜ <@&1003713161238679652> (Discord Oznámení)\n" +
                "<:saturn:1012080877242687500> ➜ <@&1003713511710543952> (SkyBlock Oznámení)\n" +
                "<:games:1003709662941675541> ➜ <@&1003713647845052466> (Hypixel Games Oznámení)"
            )
            .setFooter({ text: "Kliknutím na tlačítko si roli přidáš nebo odebereš." });

        // Tlačítka - ID formát: "customroles_toggle_IDROLE"
        // 1. Řádek - Pingy
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('customroles_toggle_1003713161238679652')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:discord:1003709661335277569>'),
            new ButtonBuilder()
                .setCustomId('customroles_toggle_1003713511710543952')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:saturn:1012080877242687500>')
        );


        // Odeslání do kanálu (ne ephemeral, aby to viděli všichni)
        await interaction.channel.send({ embeds: [embed], components: [row1] });
        await interaction.editReply({ content: "✅ Panel s rolemi byl odeslán." });
    },

    // --- 2. REAKCE NA TLAČÍTKO ---
    toggle: async (uhg, interaction) => {
        // ID tlačítka: customroles_toggle_ROLEID
        const roleId = interaction.customId.split('_')[2];
        const guild = interaction.guild;

        if (!guild) return interaction.reply({ content: "Chyba serveru.", flags: [MessageFlags.Ephemeral] });

        // Získání role a člena
        const role = guild.roles.cache.get(roleId);
        const member = interaction.member;

        if (!role) {
            return interaction.reply({ content: "❌ Tato role již na serveru neexistuje.", flags: [MessageFlags.Ephemeral] });
        }

        try {
            if (member.roles.cache.has(roleId)) {
                // MÁ ROLI -> ODEBRAT
                await member.roles.remove(role);
                await interaction.reply({ 
                    content: `🗑️ Role **${role.name}** ti byla odebrána.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            } else {
                // NEMÁ ROLI -> PŘIDAT
                await member.roles.add(role);
                await interaction.reply({ 
                    content: `✅ Role **${role.name}** ti byla přidána.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        } catch (e) {
            console.error("Chyba při změně role:", e);
            await interaction.reply({ 
                content: "❌ Nepodařilo se změnit roli. (Možná má bot nižší oprávnění než role?)", 
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }
};
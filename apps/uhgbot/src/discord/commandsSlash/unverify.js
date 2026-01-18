/**
 * src/discord/commandsSlash/unverify.js
 * Odstraní propojení Discordu a Minecraftu.
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: "unverify",
    description: "Zruší propojení tvého účtu (nebo jiného uživatele)",
    permissions: [], // Veřejný (pro sebe), admin kontrola uvnitř
    options: [
        {
            name: "target",
            description: "(Admin) Koho chceš odpojit?",
            type: 6, // USER
            required: false
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        let targetUser = interaction.user;
        let isAdminAction = false;

        // Kontrola admin módu
        if (interaction.options.getUser('target')) {
            // Zde doplň ID adminů nebo rolí
            const adminIds = ['378928808989949964', '312861502073995265']; 
            if (!adminIds.includes(interaction.user.id)) {
                return interaction.editReply("❌ Nemáš oprávnění odpojit jiného uživatele.");
            }
            targetUser = interaction.options.getUser('target');
            isAdminAction = true;
        }

        // 1. Smazání z databáze (použití nové metody)
        const deletedData = await uhg.db.deleteVerify(targetUser.id);

        if (!deletedData) {
            return interaction.editReply(isAdminAction 
                ? `⚠️ Uživatel **${targetUser.username}** není verifikovaný.`
                : `⚠️ Nejsi verifikovaný. Použij \`/verify\`.`
            );
        }

        // 2. Aktualizace rolí na Discordu (odebrání)
        try {
            await uhg.roles.updateMember(targetUser.id);
        } catch (e) {
            console.error("Chyba při odebírání rolí:", e);
        }

        // 3. Odpověď
        const embed = new uhg.dc.Embed()
            .setTitle("🔗 Unverify Úspěšné")
            .setColor("Red")
            .setDescription(isAdminAction 
                ? `Účet **${targetUser.username}** byl odpojen od nicku **${deletedData.nickname}**.`
                : `Tvůj účet byl odpojen od nicku **${deletedData.nickname}**.`
            )
            .setFooter({ text: "Role a přezdívka byly resetovány." });

        await interaction.editReply({ embeds: [embed] });

        // Log
        const logChannel = uhg.dc.cache.channels.get('logs');
        if (logChannel) {
            logChannel.send(`🗑️ **UNVERIFY:** ${interaction.user.username} odpojil účet ${deletedData.nickname} (${targetUser.username}).`);
        }
    }
};
/**
 * src/discord/commandsSlash/unverify.js
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: "unverify",
    description: "Zruší propojení účtu",
    options: [
        { name: "target", description: "(Admin) Koho odpojit?", type: 6, required: false }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        let targetUser = interaction.user;
        let isAdminAction = false;

        const targetOpt = interaction.options.getUser('target');
        if (targetOpt) {
            if (!uhg.handlePerms([{ type: 'USER', id: '378928808989949964' }], interaction)) {
                return interaction.editReply("❌ Nemáš práva odpojit někoho jiného.");
            }
            targetUser = targetOpt;
            isAdminAction = true;
        }

        const deletedData = await uhg.db.deleteVerify(targetUser.id);
        if (!deletedData) return interaction.editReply("⚠️ Uživatel není verifikovaný.");

        const member = interaction.guild.members.cache.get(targetUser.id);
        if (member) await uhg.roles.updateMember(member, null);

        await interaction.editReply(`✅ Účet **${targetUser.username}** byl odpojen od nicku **${deletedData.username}**.`);
    }
};

module.exports = async (uhg, interaction) => {
  
    const cmd = uhg.commands.get(interaction.commandName);
    if (!cmd) {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        return interaction.editReply({ content: "Command nebyl nalezen, kontaktuj prosím developery!", ephemeral: true });
    }

    interaction.member = interaction.guild ? interaction.guild.members.cache.get(interaction.user.id) : null;

    if (!uhg.handlePerms(cmd.permissions, interaction)) {
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        return interaction.editReply({ content: "Nemáš potřebná oprávnění!", ephemeral: true });
    }

    cmd.run(uhg, interaction).catch(async (e) => {
        if (interaction.deferred === false && interaction.replied === false) interaction.reply({ embeds: [await console.error(e)], ephemeral: true })
        else interaction.followUp({ embeds: [await console.error(e)], ephemeral: true })
    })
}

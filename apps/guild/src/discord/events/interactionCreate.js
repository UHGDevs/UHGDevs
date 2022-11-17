
module.exports = async (uhg, interaction) => {
    if (interaction.isChatInputCommand()) require('../interaction/slashcommands')(uhg, interaction)
    else if (interaction.isAutocomplete())  uhg.commands.get(interaction.commandName).autocomplete(uhg, interaction)
    else if (interaction.customId?.split('_')[1] == 'cmd' && uhg.commands.get(interaction.customId.split('_')[0])) try { uhg.commands.get(interaction.customId.split('_')[0])[interaction.customId.split('_')[2]] (uhg, interaction) } catch (e) {console.error(e).then((n) => interaction.reply({ embeds: [n], ephemeral: true}).catch((a) => interaction.followUp({ embeds: [n], ephemeral: true}).catch((o) =>{console.error(o)})))}
    else if (interaction.customId?.split('_')[0] === 'loot') require(`../../features/lootboxes/interactions/${interaction.customId.split('_')[1]}`)(uhg.loot, interaction)
    else if (interaction.customId) require(`../interaction/${interaction.customId.split('_')[0]}`)(uhg, interaction)
}

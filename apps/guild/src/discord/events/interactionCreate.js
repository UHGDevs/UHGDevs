
module.exports = async (uhg, interaction) => {
    if (interaction.isChatInputCommand()) require('../interaction/slashcommands') (uhg, interaction)
    else if (interaction.isAutocomplete()) require(`../interaction/autocomplete/${interaction.commandName}`) (uhg, interaction)
    else if (interaction.customId?.startsWith('modal_')) uhg.commands.get(interaction.customId.split('_')[2])[interaction.customId.split('_')[1]](uhg, interaction)
    else if (interaction.customId?.split('_')[0] === 'loot') require(`../../features/lootboxes/interactions/${interaction.customId.split('_')[1]}`) (uhg.loot, interaction)
    else if (interaction.customId) require(`../interaction/${interaction.customId.split('_')[0]}`) (uhg, interaction)
}

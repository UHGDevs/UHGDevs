
module.exports = (uhg, interaction) => {
    let focused = interaction.options.getFocused();
    interaction.respond(uhg.badges.badges?.map(n => { return {value: n.name, name: n.name} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())) || []) 
}

module.exports = async (uhg, interaction) => {
  if (!uhg.badges) return interaction.respond([ {name: 'Nejsou načtené žádné badges', value: 'error' }])
  let focused = interaction.options.getFocused();
  return interaction.respond(uhg.badges.map(n => { return {name: n.name, value: n.name} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())) || [])
}

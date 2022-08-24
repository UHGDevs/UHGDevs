
module.exports = async (uhg, interaction) => {
  if (!uhg.badges) return interaction.respond([ {name: 'Nejsou načtené žádné badges', value: 'error' }])
  return interaction.respond(uhg.badges.map(n => { return {name: n.name, value: n.name} }))
}



const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js')

module.exports = {
    name: 'lb',
    description: 'CZSK Leaderboards!',
    permissions: [{ id: '378928808989949964', type: 'USER', permission: true}, { id: '312861502073995265', type: 'USER', permission: true},  { id: '379640544143343618', type: 'USER', permission: true}],
    options: [
      {
        name: 'game',
        description: 'Jakou hru chceš vidět?',
        type: 3,
        required: true,
        autocomplete: true
      },
      {
        name: 'stat',
        description: 'Jakoý stat chceš vidět?',
        type: 3,
        required: false,
        autocomplete: true
      },
      {
        name: 'gamemode',
        description: 'Jaký gamemode chceš upravit?',
        type: 3,
        required: false,
        autocomplete: true
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: false }).catch(() => {})

      

      await interaction.editReply({ /*embeds: []*/ })
    },
    autocomplete: (uhg, interaction) => {

      let current = interaction.options._hoistedOptions.filter(n => n.focused)[0].name
      let focused = interaction.options.getFocused()

      let game = interaction.options.getString('game')
      if (current == 'game') return interaction.respond(uhg.lb.data?.map(n => { return {value: n.game, name: n.game} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())) || []) 
      if (!game) return interaction.respond([ {name: 'Vyber nejdřív hru!', value: 'err'} ])

      game = uhg.lb.get(game)
      if (!game) return interaction.respond([ {name: 'Neplatná hra', value: 'err'} ])

      let stat = interaction.options.getString('stat')?.split('%%')[0]
      let gamemode = interaction.options.getString('gamemode')

      let ignore = game.ignore || []

      let options;
      if (current == 'stat') {
        options = game?.stats?.map(n => { return {value: n, name: n.split('%%')[0]}})
          .filter(n => n.name.toLowerCase().includes(focused.toLowerCase())).filter(n => {
            if (!gamemode) return true
            if (ignore.find(f => f.startsWith('!') && !f.includes(gamemode) && f.includes(n.name))) return false
            if (ignore.find(f => !f.startsWith('!') && f.includes(gamemode) && f.includes(n.name))) return false
            return true
          })
      }
      if (current == 'gamemode') {
        options = game?.gamemode?.map(n => { return {value: n, name: n} })
          .filter(n => n.name.toLowerCase().includes(focused.toLowerCase())).filter(n => {
            if (!stat) return true
            if (ignore.find(f => f.startsWith('!') && f.includes(stat) && !f.includes(n.name))) return false
            if (ignore.find(f => !f.startsWith('!') && f.includes(stat) && f.includes(n.name))) return false
            return true
          })
      }
      
      return interaction.respond(options || [{name: 'Není k dispozici zádný výběr!', value: 'err'}]) 
    }
}
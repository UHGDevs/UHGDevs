

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

      if (interaction.options._hoistedOptions.find(n => n.value == 'err')) return interaction.editReply({ embeds: [{ title: 'ERROR', description: `... dont try ...`, footer: { text: 'Also, JOIN UHG'}, color: 15548997 }] })

      let game = uhg.lb.get(interaction.options.getString('game'))
      if (!game) return interaction.editReply({ embeds: [{ title: 'ERROR', description: `Hra \`${interaction.options.getString('game')}\` nebyla nalezena!`, color: 15548997 }] })

      let stat = interaction.options.getString('stat')?.split('%%')[0] || game.default
      let gamemode = interaction.options.getString('gamemode') || 'overall'
      let ignore = game.ignore || []
      
      if (ignore.find(f => f.startsWith('!') && f.includes(stat) && !f.includes(gamemode)) || ignore.find(f => !f.startsWith('!') && f.includes(stat) && f.includes(gamemode))) return interaction.editReply({ embeds: [{ title: 'ERROR', description: `\`${stat}\` není podporováno v \`${gamemode}\`!`, color: 15548997 }] })
      if (gamemode && !game.gamemode.includes(gamemode) || stat && !game.stats.map(n => n.split('%%')[0]).includes(stat)) return interaction.editReply({ embeds: [{ title: 'ERROR', description: `Nevymýšlej si PL vlastní statistiky nebo gamemody, to co je, to je.`, footer: { text: 'Pokud něco chybí, kontaktuj developery!'}, color: 15548997 }] })


      /* where the magic happens */
      
      let path = ('.' + game.path.replaceAll('/', '.') ?? '').replaceAll('..', '.') 
      let keys = await uhg.getRedisKeys()
      let names = await uhg.redis_get(keys, '.username').then(n => n.data)
      console.log(names)
      let stats = await uhg.redis_get(keys, path).then(n => n.data.filter(f => f))

      stats = stats.map(n => {
        if (!n[1]) return
        return [names.find(a => a[0] == n[0])[1], (n[1][stat] ? n[1][stat] : n[1][gamemode][stat]) ?? -0]
      }).filter(n => n).sort((a, b) => b[1] - a[1])


      await interaction.editReply({ content: stats.map(n => n[0] + ' ' + n[1]).slice(0, 10).join('\n') /*embeds: []*/ })
    },
    autocomplete: (uhg, interaction) => {

      if (!uhg.redis) return interaction.respond([ {name: 'Není zaplá DB!', value: 'err'} ])

      let current = interaction.options._hoistedOptions.filter(n => n.focused)[0].name
      let focused = interaction.options.getFocused()

      let game = interaction.options.getString('game')
      if (current == 'game') return interaction.respond(uhg.lb?.data?.map(n => { return {value: n.game, name: n.game} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())) || []) 
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
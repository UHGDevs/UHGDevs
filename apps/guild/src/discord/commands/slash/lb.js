

const fs = require('fs');
const path = require('node:path');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js')

const buttons = new ActionRowBuilder()
  .addComponents(new ButtonBuilder().setCustomId('lb_cmd_recieve_first').setStyle(1).setEmoji('⏮'))
  .addComponents(new ButtonBuilder().setCustomId('lb_cmd_recieve_back').setStyle(1).setEmoji('◀'))
  .addComponents(new ButtonBuilder().setCustomId('lb_cmd_recieve_next').setStyle(1).setEmoji('▶'))
  .addComponents(new ButtonBuilder().setCustomId('lb_cmd_recieve_last').setStyle(1).setEmoji('⏭'));


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
      },
      {
        name: 'find',
        description: 'Chceš najít nějakého hráče??',
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
      
      let apipath = ('.' + game.path.replaceAll('/', '.') ?? '').replaceAll('..', '.') 
      let keys = await uhg.getRedisKeys()
      let names = await uhg.redis_get(keys, '.username').then(n => n.data)
      let stats = await uhg.redis_get(keys, apipath).then(n => n.data.filter(f => f))

      stats = stats.map(n => {
        if (!n[1]) return
        return [names.find(a => a[0] == n[0])[1], (n[1][stat] ? n[1][stat] : n[1][gamemode][stat]) ?? -0]
      }).filter(n => n).sort((a, b) => b[1] - a[1])

      let title = `CZSK ${renameHypixelGames(game.game)} ${gamemode} ${stat} leaderboard`
      let description = `ㅤ`

      let format = chunk(stats.map((n, i) => `\`#${i+1}\` ${n.length > 2 ? n[3] + ' ': ''}**${n[0]}:** \`${n[1]}\``), 20)
      
      let embeds = format.map((a, i) => { return { title: title, description: description, color: 5592575, footer: { text: `${i+1}/${format.length}`}, fields: [{ name: 'ㅤ', value: a.join("\n"), inline: false}]} })
      if (!embeds.length) embeds = [{ title: title, description: description, color: 5592575, footer: { text: `${0}/${0}`}, fields: [{ name: 'ㅤ', value: '**V databázi nejsou uloženi žádní hráči**', inline: false}]}]
      


      let find = interaction.options.getString('find')?.toLowerCase()
      let embed = ((find && find !== 'null') ? embeds.find(n => String(n.fields[0].value).toLowerCase().includes(`**${find}:`)) : embeds[0]) ?? embeds[0]


      let cache = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../cache/lb.json'), 'utf8'));
      cache[title] = embeds
      await fs.writeFile(path.join(__dirname, '../../../../cache/lb.json'), JSON.stringify(cache, null, 4), 'utf8', data =>{})


      await interaction.editReply({ embeds: [embed], components: [buttons] })
    },
    autocomplete: async (uhg, interaction) => {

      if (!uhg.redis) return interaction.respond([ {name: 'Není zaplá DB!', value: 'err'} ])

      let current = interaction.options._hoistedOptions.filter(n => n.focused)[0].name
      let focused = interaction.options.getFocused()

      if (current == 'find') {
        let keys = await uhg.getRedisKeys()
        let names = await uhg.redis_get(keys, '.stats.username').then(n => n.data.filter(a => a && a[1]))

        names = names.sort((a, b) => a[1].localeCompare(b[1]))

        return interaction.respond(names?.map(n => { return {value: n[1], name: n[1]} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())).slice(0, 25) || [{ value: 'null', name: 'Nebyl nalezen žádný hráč'}])
      }

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
    },
    recieve: async (uhg, interaction) => {
      await interaction.update({ type: 6 })

      const znovu = { title: 'ERROR', description: 'Nepodařilo se načíst cache!\nPoužij prosím příkaz znovu', color: 15158332, footer: {text: 'UHGDevs' }}
      let embeds = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../cache/lb.json'), 'utf8'));
      let pages = embeds[interaction.message.embeds[0].title]

      if (!pages) return interaction.editReply({ embeds: [znovu], components: [] })

      let pageid = interaction.customId.toLowerCase()
      let v = interaction.message.embeds[0].footer.text.split("/")[0]

      if (pageid.includes('first')) {
        await interaction.editReply({ embeds: [pages[0]] })
      } else if (pageid.includes('back') && v>1) {
          await interaction.editReply({ embeds: [pages[v-2]] })
      } else if (pageid.includes('next') && v < pages.length) {
          await interaction.editReply({ embeds: [pages[v]] })
      } else if (pageid.includes('last')) await interaction.editReply({ embeds: [pages[pages.length-1]] })


    }
}


const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js')

module.exports = {
    name: 'comparation',
    description: 'GEXP porovnání UHG a TKJK guild!',
    permissions: [{ id: '312861502073995265', type: 'USER', permission: true }, { id: '378928808989949964', type: 'USER', permission: true }, { id: '419183469911080960', type: 'USER', permission: true }],
    options: [
      {
        name: 'date',
        description: 'Jaký den chceš vidět? *2021-12-24*',
        type: 3,
        required: false
      },
      {
        name: 'refresh',
        description: 'Chceš nejdřív aktualizovat databázi? *u minulých dní není potřeba*',
        type: 3,
        choices: [
          { name: 'Ano, počkám déle', value: 'yessss' },
          { name: 'Ne, nechci čekat', value: 'n'}
        ],
        required: false
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      let dc = !isInteraction(interaction)
      dc || await interaction.deferReply({ ephemeral: false })
      let options = {
        refresh: interaction?.options?.getString('refresh')?.length > 2 ?? interaction.refresh ?? false,
        date: interaction?.options?.getString('date') || interaction.date || new Date()
      }
      let date = new Date(options.date).toISOString().slice(0, 10)

      if ((options.refresh === true || options.refresh === undefined)) {
          let refresh = uhg.time.events.get('guilddb')
          if (!uhg.time.ready[refresh.name]) await uhg.time.running[refresh.name]
          else {
              uhg.time.eventStart(refresh)
              uhg.time.running[refresh.name] = refresh.run(uhg, {}).catch(async (e) => {
                  let err = await console.error(e, 'Time Event ERROR')
                  global.logging_channel?.send({ embeds: [err] })
              });
              await uhg.time.running[refresh.name]
              uhg.time.eventEnd(refresh)
          }
      }


      let data = {
          uhg: await uhg.get('uhg', 'info', {_id: 'xp'}).then(n => n[0]),
          tkjk: await uhg.get('tkjk', 'info', {_id: 'xp'}).then(n => n[0])
      }

      /* -- SOME functions -- */
      const exp = (guild = 'uhg', timestamp = 'daily') => data[guild][timestamp][date]
      const level = (guild = 'uhg', timestamp = 'daily') => timestamp == 'daily' ? ggl(data[guild][timestamp][date]) : gl(data[guild][timestamp][date])

      let fields = [
          {name: "UHG", value: `Level: ${Math.round(level('uhg', 'total_daily')*10000)/10000}\nDen: ${Math.round(level()*10000)/10000}\nExp: ${f(exp()/1000)}k`, inline: true},
          {name: "TKJK", value: `Level: ${Math.round(level('tkjk', 'total_daily')*10000)/10000}\nDen: ${Math.round(level('tkjk')*10000)/10000}\nExp: ${f(exp('tkjk')/1000)}k`, inline: true },
          {name: "Rozdíl:", value: `Celkový: ${Math.abs(Math.round((level('uhg', 'total_daily') - level('tkjk', 'total_daily'))*10000)/10000)}\nDen: ${Math.round((level() - level('tkjk'))*100000)/100000}\nExp: ${f((exp() - exp('tkjk'))/1000)}k${exp() - exp('tkjk') < 0 ? '' : `\nPočet dní: ${Math.ceil((exp('tkjk', 'total_daily') - exp('uhg', 'total_daily'))/(exp() - exp('tkjk')))} dní`}`, inline: false}
      ]
      let embed = { title: 'UHG vs TKJK ' + date, color: exp() - exp('tkjk') > 0 ? 2067276 : 15548997, fields: fields }

      dc || await interaction.editReply({ embeds: [embed] })
      return { embed: embed, mc: 'Celkový rozdíl: ' + Math.abs(Math.round((level('uhg', 'total_daily') - level('tkjk', 'total_daily'))*10000)/10000)}

    }
}


const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js')

const DATA = {
    name: 'time',
    description: 'TIME event GUI!',
    permissions: [{ id: '378928808989949964', type: 'USER', permission: true}, { id: '312861502073995265', type: 'USER', permission: true},  { id: '379640544143343618', type: 'USER', permission: true}],
    options: [],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      if (!interaction.customId) await interaction.deferReply({ ephemeral: false }).catch(() => {})

      let auth = ['378928808989949964', '312861502073995265', '379640544143343618', '427198829935460353']
      if (!auth.includes(interaction.user.id)) return interaction.followUp({ embeds: [{title: `**TIME EVENT UNVERIFIED**`, color: 15548997, description: `Nejsi na whitelistu :/`}], ephemeral: true })

      if (!uhg.time.events.size) await interaction.editReply({ embeds: [{ title: '**Time Events GUI**', color: 15548997, footer: { text: 'Made with love ❤️' }, description: 'Loading, please wait' }]})

      let options = []

      let desc = uhg.time.events.map(event => {
        let toggle = config.time[event.name]
        let message = (event.emoji ? (event.emoji + ' - ') : '') + (toggle ? ('**' + event.name + '**') : event.name)
        if (toggle && event.executedAt) message = message + ` <t:${Math.round(Number(new Date(event.executedAt))/1000)}:R>`
        if (event.onstart) message = message + ' 🕐'
        options.push({label: event.emoji + ' ' + event.name + (toggle ? ' ✅':''), description: event.description, value: event.name})
        return message
      })

      let embed = { title: '**Time Events GUI**', color: 5592575, footer: { text: `${Object.values(config.time).filter(n => n).length}/${uhg.time.events.size} Time Events` }, description: desc.join('\n') }
      const menu = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId('time_cmd_gui').setPlaceholder('Choose one for more info').addOptions(options));
      await interaction.editReply({ embeds: [embed], components: [menu] })
    },
    gui: async (uhg, interaction) => {
      try { await interaction.update({ type:6, ephemeral: true }) } catch (e) {}
      let type = interaction.updateGUI || ((interaction.values?.length) ? interaction.values[0] : null) || interaction.message.embeds[0].title.split(' ').filter(n => n.includes('_'))[0].toLowerCase().replaceAll('_', '').replaceAll('*', '')
      interaction.updateGUI = type

      let nastaveni = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../config.json'), 'utf8'));
      let toggle = !nastaveni.time[type]

      let event = uhg.time.events.get(type)
      if (!event) return interaction.followUp({ embeds: [{ title: `**TIME EVENT ERROR**`, description: `**${type} Time Event** není načtený`, color: 15548997}], ephemeral: true })
      
      let embed = { title: `${event.emoji} **__${type} Time Event__** ${event.emoji}`, color: 5592575, description: event.description, fields: [], footer: { text: `ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\n *ㅤㅤ*ㅤㅤ*ㅤㅤ*ㅤㅤ*ㅤㅤ*\nsec min hour date month day`}}
      embed.fields.push({ name: `ㅤ`, value: `**__Basic Info__**`, inline: false})
      embed.fields.push({ name: 'Toggle', value: (!toggle ? '✅' : '🟥') + (event.onstart ? ' | 🕐' : ''), inline: true})

      let execution = event.executedAt ? `<t:${Math.round(Number(new Date(event.executedAt))/1000)}:R>` : `🟥 `

      if (uhg.time.running[type]) execution = '👟' + ` | <t:${Math.round(Number(new Date(event.executedAt || new Date()))/1000)}:R>`
      embed.fields.push({ name: 'Last Execution', value: execution, inline: true})
      embed.fields.push(...[
        { name: 'Next execution', value: `<t:${Math.round(new Date(event.start.nextDates()).getTime()/1000)}:R>`, inline: true },
        { name: 'Period', value: `\`${event.start.cronTime.source}\``, inline: true },
        { name: 'Ignore', value: `\`${event.ignore}\``, inline: true }
      ])

      if (event.lastTime) {
        embed.fields.push(...[
          { name: `ㅤ`, value: `**__Nerds Stats__**`, inline: false},
          { name: 'Count', value: `\`${event.count}\``, inline: true },
          { name: 'Last Time', value: `\`${f(event.lastTime/1000)}s\``, inline: true },
          { name: 'Average Time', value: `\`${f(event.averageTime/1000)}s\``, inline: true },
          { name: `Max Time [${event.times.indexOf(Math.max(...event.times)) + 1}]`, value: `\`${Math.round(Math.max(...event.times)/100)/10}s\``, inline: true },
          { name: `Min Time [${event.times.indexOf(Math.min(...event.times)) + 1}]`, value: `\`${Math.round(Math.min(...event.times)/100)/10}s\``, inline: true },
        ])
      }
    
      if (event.errors) {
        embed.fields.push({ name: `ㅤ`, value: `**__${event.errors.length} Error${event.errors.length>1?`s`:``}__**`, inline: false})
        embed.fields.push(event.errors.slice(0,5))
      }

      let options = uhg.time.events.map(ev => { return {label: ev.emoji + ' ' + ev.name + (config.time[ev.name] ? ' ✅':''), description: ev.description, value: ev.name}})
      const menu = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId('time_cmd_gui').setPlaceholder(`${type} Time Event GUI`).addOptions(...options));
      const buttons = new ActionRowBuilder()
        .addComponents(new ButtonBuilder().setCustomId(`time_cmd_toggle_${type}`).setStyle(!toggle ? 4:3).setLabel(!toggle ? 'DISABLE':'ENABLE'))
        .addComponents(new ButtonBuilder().setCustomId(`time_cmd_action_${type}`).setStyle(3).setLabel('RUN'))
        .addComponents(new ButtonBuilder().setCustomId(`time_cmd_refresh_${type}`).setStyle(2).setLabel('REFRESH'))

      interaction.editReply({ embeds: [embed], components: [menu, buttons], ephemeral: true })
    },
    toggle: async (uhg, interaction) => {
      try { await interaction.update({ type:6, ephemeral: true }) } catch (e) {}
      let type = interaction.customId.split('_')[3]

      interaction.updateGUI = type

      let event = uhg.time.events.get(type)
      if (!event) return interaction.followUp({ embeds: [{ title: `**TIME EVENT ERROR**`, description: `**${type} Time Event** nebyl nalezen`, color: 15548997}] })
      

      let nastaveni = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../config.json'), 'utf8'));
      let toggle = !nastaveni.time[type]
      nastaveni.time[type] = toggle
      
      await fs.writeFile(path.join(__dirname, '../../../../config.json'), JSON.stringify(nastaveni, null, 4), 'utf8', data =>{})
      
      let embed = { title: `${event.emoji} **__${type} Time Event__** ${event.emoji}`, color: 5592575, description: event.description, fields: [], footer: { text: '--- By DavidCzPdy 🤖 ---'}, fields: [{ name: '**__Action__**', value: `${ toggle ? 'Disabled': 'Enabled'} ${type} Time Event`, inline: false}]}
      await interaction.followUp({ embeds: [embed], ephemeral: true })
      refresh(uhg, interaction)
    },
    action: async (uhg, interaction) => {
      try { await interaction.update({ type:6, ephemeral: true }) } catch (e) {}
      let event = uhg.time.events.get(interaction.customId.split('_')[3])

      let embed = { title: `${event.emoji} **__${event.name} Time Event__** ${event.emoji}`, color: 5592575, fields: [], footer: { text: '--- By DavidCzPdy 🤖 ---'}, fields: []}

      if (uhg.time.ready[event.name]) {
        uhg.time.eventStart(event)
        uhg.time.running[event.name] = event.run(uhg, {}).catch(async (e) => {
            let err = await console.error(e, 'Time Event ERROR')
            global.logging_channel?.send({ embeds: [err] })
        }).then(n => { uhg.time.eventEnd(event) })
        embed.fields.push({ name: '**__Result__**', value: `**SUCCESS**\n${event.name} is now running`})
      } else {
        embed.color = 15548997
        embed.fields.push(...[{ name: '**__Result__**', value: `**REJECTED**`}, {name: '**__Reason__**', value: `${event.name} is already RUNNING`, inline: false}])
      }
      interaction.followUp({ embeds: [embed], ephemeral: true })
    },
    refresh: refresh
}

function refresh(uhg, interaction) {
  try { DATA.gui(uhg, interaction) } catch (e) { console.error(e) }
}

module.exports = DATA
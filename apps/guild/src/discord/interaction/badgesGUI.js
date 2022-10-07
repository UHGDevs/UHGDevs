
const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, ModalBuilder, TextInputBuilder } = require('discord.js')

const auth = ['378928808989949964', '379640544143343618', '312861502073995265']


module.exports = async (uhg, interaction) => {
    /* -- PERMISSIONS -- */
    if (!auth.includes(interaction.user.id)) return interaction.reply({ ephemeral: true, embeds: [ { title: `Nemáš oprávnění`, description: 'Nemáš práva měnit nastavení badges', color: 15158332 }] })

    /* -- BASICS -- */
    let type = interaction.customId.split('_')[1]
    let action = interaction.customId.split('_')[2]

    let msg = interaction.message

    let badges = uhg.badges


    /* -- UPDATE INTERACTION -- */
    if (!(type?.match(/badge|stat/) && action?.match(/edit|add/))) await interaction.update({ type:6, ephemeral: true }).catch(e => {});

    /* -- Get MINIGAME -- */
    msg.badge = interaction.values && action == 'choice' ? interaction.values[0] : (msg.components[0].components[0].data.options.find(n => n.default === true) ?  msg.components[0].components[0].data.options.find(n => n.default === true).value : msg.components[0].components[0].data.options[0].value)
    msg.stat = interaction.values && action == 'stat' ? interaction.values[0] : (msg.components[2].components[0].data.options.find(n => n.default === true) ?  msg.components[2].components[0].data.options.find(n => n.default === true).value : msg.components[2].components[0].data.options[0].value)
    if (!msg.rotate) msg.rotate = 0

    if (interaction.values == 'void') return
    badge = await uhg.get('general', 'badges', {name: msg.badge}).then(n => n[0])

    /* -- ACTIONS -- */

    if (type == 'badge' || type == 'stat') {
        if (action == 'edit' || action == 'add') {

            if (type == 'badge') {
                let name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`badge_name`).setLabel("Název").setStyle(1).setPlaceholder(badge.name).setRequired(action == 'add' ? true : false));
                let global_path = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`global_path`).setLabel("Global Path").setStyle(1).setPlaceholder(`${badge.path}`).setRequired(action == 'add' ? true : false));
    
                const modal = new ModalBuilder().setCustomId(`badgesGUI_modal_badge-${action}`).setTitle(`Nastavení ${action == 'add' ? 'nové' : badge.name} badge`).addComponents([name, global_path])  
                return await interaction.showModal(modal);  
            } else if (type == 'stat') {
                let stat = badge.stats.find(n => n.name == msg.stat) || {}
                let name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`name`).setLabel("Název").setStyle(1).setPlaceholder(stat.name || 'Výhry').setRequired(action == 'add' ? true : false));
                let path = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`path`).setLabel("Path").setStyle(1).setPlaceholder(stat.path || 'wins').setRequired(action == 'add' ? true : false));
                let req = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`req`).setLabel("Req").setStyle(1).setPlaceholder(stat.req?.join(', ') || '[1, 2, 3]').setRequired(action == 'add' ? true : false));
    
                const modal = new ModalBuilder().setCustomId(`badgesGUI_modal_stat-${action}`).setTitle(`Nastavení ${action == 'add' ? 'nové' : msg.stat} statistiky`).addComponents([name, path, req])  
                return await interaction.showModal(modal);  
            }
            
        }

        else if (action == 'remove') {
            if (type == 'badge') await uhg.delete('general', 'badges', { name: msg.badge })
            if (type == 'stat') {
                badge.stats = badge.stats.filter(n => n.name !== msg.stat)
                await uhg.post('general', 'badges', badge)
            }
            let json =  await uhg.get('general', 'badges', {})
            uhg.badges.json = json
            msg.badge = json.find(n => n.name == msg.badge) || json[0].name
        }
    }

    if (type == 'modal') {
        if (action.startsWith('badge')){
            if (action.endsWith('add')) badge = {}
            badge.name = interaction.fields.getTextInputValue('badge_name') || badge.name
            badge.path = interaction.fields.getTextInputValue('global_path') || badge.path
            msg.badge = badge.name

            if (!badge._id) badge._id = Number(new Date())
            if (!badge.stats) badge.stats = []
            await uhg.post('general', 'badges', badge)
        }
        else if (action.startsWith('stat')) {
            let stat = action.endsWith('add') ? {} : badge.stats.find(n => msg.stat)

            stat.name = interaction.fields.getTextInputValue('name') || stat.name
            stat.path = interaction.fields.getTextInputValue('path') || stat.path
            stat.req = interaction.fields.getTextInputValue('req')?.replaceAll('[', '').replaceAll(']', '').trim().split(',').map(n => Number(n)) || stat.req

            if (action.endsWith('add')) badge.stats.push(stat)

            await uhg.post('general', 'badges', badge)
        }
    }


    let info = { title: `${badge.name} Badge`, description: `Path: ${badge.path}\n\n${badge.stats.map((n, i) => `${badge.emoji ? badge.emoji + ' ' : ''}**${n.name}**:\nAPI: *${n.path}*\nREQ: *${n.req.join(', ')}*`).join('\n')}` }

    const row = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`badgesGUI_set_choice`).addOptions(badges.badges.map((e, i) => { return {label: e.name, value: e.name, emoji: undefined, default: e.name == msg.badge ? true : false }} )));
    const stat = new ActionRowBuilder().addComponents(new SelectMenuBuilder().setCustomId(`badgesGUI_set_stat`).addOptions(badge.stats.length ? badge.stats.map((e, i) => { return {label: e.name, value: e.name, emoji: undefined, default: e.name == badge.stats.find(n => n.name == msg.stat) || e.name == badge.stats[0].name}} ) : { label: 'Přidej novou statistiku', value: 'void'}));

    const buttons = new ActionRowBuilder()
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_badge_edit').setStyle(ButtonStyle.Primary).setEmoji('🔧'))
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_badge_add').setStyle(ButtonStyle.Primary).setEmoji('🆕'))
        .addComponents(new ButtonBuilder().setCustomId('badgesGUI_badge_remove').setStyle(ButtonStyle.Primary).setEmoji('<:false:1011238405943865355>'));

    const buttons_stat = new ActionRowBuilder()
    .addComponents(new ButtonBuilder().setCustomId('badgesGUI_stat_edit').setStyle(ButtonStyle.Primary).setEmoji('🔧'))
    .addComponents(new ButtonBuilder().setCustomId('badgesGUI_stat_add').setStyle(ButtonStyle.Primary).setEmoji('🆕'))
    .addComponents(new ButtonBuilder().setCustomId('badgesGUI_stat_remove').setStyle(ButtonStyle.Primary).setEmoji('<:false:1011238405943865355>'));

    const zprava = { components: [row, buttons, stat, buttons_stat], embeds: [info] }
    await interaction.editReply(zprava)
}



const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const fs = require('fs');
const path = require('node:path');


module.exports = {
    name: 'editlb',
    description: 'Edit CZSK clbs!',
    permissions: [ {id: '378928808989949964', type: 'USER', permission: true }, { id: '660441379310272513', type: 'USER', permission: true}],
    options: [
      {
        name: 'game',
        description: 'Jakou hru chceš upravit?',
        type: 3,
        required: true,
        autocomplete: true
      }
    ],
    type: 'modal',
    platform: 'discord',
    run: async (uhg, interaction) => {
      let game = interaction.options.getString('game')
      let lb = uhg.lb.get(game) 

      const textBox = (options) => new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(options.id).setLabel(options.text).setPlaceholder(options.example ?? '').setStyle(options.style || 1).setRequired(options.required ?? true).setValue(options.value || '').setMaxLength(options.max ?? 4000).setMinLength(options.min ?? 0))

        const modal = new ModalBuilder().setCustomId('editlb_cmd_game_'+game).setTitle(`Nová ${game} LB`)
          .addComponents(textBox({ id: 'gamemode', text: 'Jaké chceš mít gamemody?', example: 'overall, threes, fours', value: lb?.gamemode?.join(', ')}))
          .addComponents(textBox({ id: 'stats', text: 'Jaké chceš mít statistiky?', example: 'level, kills, deaths', value: lb?.stats?.join(', '), style: 2}))
          .addComponents(textBox({ id: 'default', text: 'Jaká je defaultní statistika?', example: 'level', value: lb?.default}))
          .addComponents(textBox({ id: 'ignore', text: 'Chceš nějaké statistiky ignorovat?', example: '!overall/level, threes/wins', required: false, value: lb?.ignore?.join(', ')}))
          .addComponents(textBox({ id: 'action', text: 'Chceš provést nějakou akci?', example: 'delete|path:' + (lb?.path || 'hypixel/stats/bedwars'), required: false}))
          
        return await interaction.showModal(modal);
  },
  autocomplete: (uhg, interaction) => {

    let focused = interaction.options.getFocused();
    interaction.respond(uhg.lb.data?.map(n => { return {value: n.game, name: n.game} }).filter(n => n.name.toLowerCase().includes(focused.toLowerCase())) || []) 
  
  },
  game: async (uhg, interaction) => {
    await interaction.reply({ content: 'Applying Changes', ephemeral: true });
    let game = getId(interaction, 3)
    let gamemode = interaction.fields.getTextInputValue('gamemode')
    let stats = interaction.fields.getTextInputValue('stats')
    let def = interaction.fields.getTextInputValue('default')
    let ignore = interaction.fields.getTextInputValue('ignore') || undefined
    let action = interaction.fields.getTextInputValue('action') || undefined


    let apipath = action?.startsWith('path:') ? action.split(':')[1].trim() : undefined

    if (action && !action.startsWith('path:')) {
      if (action == 'delete') {
        await uhg.lb.deleteLb(game)
        interaction.editReply({ content: 'Hra byla odstranena' })
      }

      await uhg.lb.reload()
      return
    }

    let post = {game: game, gamemode: gamemode, stats: stats, default: def, ignore: ignore }
    if (apipath) post.path = apipath
    if (!post.path) post.path = 'hypixel/'


    await uhg.lb.postLb(post)
    await uhg.lb.reload()

    interaction.editReply({ content: 'Hra byla změněna' })
  }
}
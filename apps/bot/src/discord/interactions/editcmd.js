const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const canva = require('uhg-canvas')

module.exports = async (uhg, interaction) => {
try {
  let type = interaction.customId.split('_')[1]
  let action = interaction.customId.split('_')[2]
  let arg = String(interaction.customId.split('_')[3])
  let krok = Number(interaction.message.components[2].components.find(n => n.customId.endsWith('_set_krok')).label.replace(/[^0-9.]/g, ''))
  let img = interaction.message.attachments.first()

  if (action !== 'modal') try { await interaction.update({ type:6, ephemeral: true }) } catch (e) {}
  if (interaction.message.ready === false) return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`KLIKÁŠ MOC RYCHLE`).setDescription('Počkej než doběhne předchozí úkol').setColor('RED')] })
  interaction.message.ready = false


  if (action == 'set' && arg == 'discard') return interaction.editReply({ components: [] })


  let data = interaction.message.cache || await uhg.mongo.run.get('general', 'commands', { _id: type }).then(n=> n[0] || null) || undefined
  if (!data) return

  let api = interaction.message.api || await uhg.api.call(img.name.split('_')[0], ['hypixel', 'guild'])
  if (!api.success) return console.log(api)
  interaction.message.api = api

  let stats_options = interaction.message.components[0].components[0].options
  interaction.message.stat = interaction.values ? interaction.values[0] : (interaction.message.stat ? interaction.message.stat : stats_options[0].value)

  if (action == 'set' && arg == 'krok') {
    if (krok === 1) krok = 5
    else if (krok === 5) krok = 10
    else if (krok === 10) krok = 50
    else krok = 1
  } else if (action == 'modal' && arg == 'settings') {
    let apply = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_apply`).setLabel("Stat - global/stat").setStyle('SHORT'));
    let color = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_color`).setLabel("Color - color code").setStyle('SHORT'));
    let font = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_font`).setLabel("Font - Minecraft|any windows font").setStyle('SHORT'));
    let size = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_size`).setLabel("Font Size - number").setStyle('SHORT'));
    let coords = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_coords`).setLabel("X/Y souřadnice - number,number").setStyle('SHORT'));

    const modal = new Modal().setCustomId(`ECMD_${type}_set_settings-1`).setTitle(`Nastavení ${type} commandu`).addComponents([apply, color, font, size, coords])
    return await interaction.showModal(modal);
  } else if (action == 'set' && arg == 'settings-1'){
    let apply = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_apply`) || interaction.message.stat).toLowerCase()
    let color = interaction.fields.getTextInputValue(`ECMD_${type}_set_color`) || null
    let font = interaction.fields.getTextInputValue(`ECMD_${type}_set_font`) || null
    let size = interaction.fields.getTextInputValue(`ECMD_${type}_set_size`) || null
    let coords = interaction.fields.getTextInputValue(`ECMD_${type}_set_coords`) || null
    
    if (size && size.includes(',')) size = size.split(',').map(n => Number(n)||20)
    if (coords) coords = coords.split(',').map(n => Number(n)||0)

    if (apply == 'global' || apply == 'default') {
      data.default.color = color || data.default.color
      data.default.font = font || data.default.font
      data.default.size = size || data.default.size
      interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`SUCCESS`).setDescription('Úspěšně jsi změnil defaultní hodnoty! Klikni na <:true:1011238431482974278> pro uložení nebo na <:false:1011238405943865355> pro zrušení!').setColor('GREEN')] })
    } else if (apply !== interaction.message.stat) {}
    else {}

    img = await canva.run(data, api)

  } else if (action == 'set' && arg == 'save') {
    await uhg.mongo.run.post('general', 'commands', data)
    interaction.editReply({ components: [] })
    return
  } else if (action == 'get' && arg == 'info') {
    let stat = data.fields.find(n => n.stat == interaction.message.stat)
    let info = `Coords: ${stat.x}:${stat.y}`
    if (stat.color !== undefined) info = info + `\nColor: ${stat.color ? stat.color : ('Default - ' + data.default.color)}`
    if (stat.font !== undefined) info = info + `\nFont: ${stat.font ? stat.font : ('Default - ' + data.default.font)}`
    if (stat.size !== undefined) info = info + `\nSize: ${stat.size ? stat.size : ('Default - ' + data.default.size)}\n`

    info = info + `\nCustom: ${stat.custom ? '✅':'🟥'}`
    if (stat.customText) info = info + `\nCustom Text: \`${stat.customText}\``

    let info_e = new MessageEmbed().setTitle(`${stat.name} v ${type} commandu`).setColor('#ff51fd').setDescription(info)
    interaction.followUp({ ephemeral: true, embeds: [info_e] })
  } else if (action == 'move') {
    let stat = data.fields.find(n => n.stat == interaction.message.stat)
    if (arg == 'up') stat.y -= krok
    else if (arg == 'down') stat.y += krok
    else if (arg == 'left') stat.x -= krok
    else if (arg == 'right') stat.x += krok

    if (stat.x < 0) stat.x = 0
    if (stat.x > data.width) stat.x = data.width
    if (stat.y < 0) stat.y = 0
    if (stat.y > data.height) stat.y = data.height
    img = await canva.run(data, api)
  }

  interaction.message.cache = data

  let but_null = ((a, b='SECONDARY') => {return new MessageButton().setCustomId(`ECMD_${type}_null_${a}`).setStyle(b).setDisabled(true).setLabel(" ")})
  
  const but1 = new MessageActionRow()
  .addComponents(but_null(1))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_up`).setStyle('PRIMARY').setLabel('▲'))
  .addComponents(but_null(2))
  .addComponents(but_null(3))
  .addComponents(but_null(4));

const but2 = new MessageActionRow()
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_left`).setStyle('PRIMARY').setLabel('◄'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_krok`).setStyle('SECONDARY').setLabel(krok + ' px'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_right`).setStyle('PRIMARY').setLabel('►'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_modal_settings`).setStyle('SECONDARY').setEmoji('<:settings:1011235478164480000>'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_get_info`).setStyle('SECONDARY').setEmoji('<:info:1011235456429604864>'));
  
const but3 = new MessageActionRow()
  .addComponents(but_null(6))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_down`).setStyle('PRIMARY').setLabel('▼'))
  .addComponents(but_null(7))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_discard`).setStyle('DANGER').setEmoji('<:false:1011238405943865355>'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_save`).setStyle('SUCCESS').setEmoji('<:true:1011238431482974278>'));

  let stat_options = new MessageSelectMenu().setCustomId(`ECMD_${type}_set`)
  stat_options.options = []

  data.fields.forEach((e, i) => {
    stat_options.options.push({ label: e.name, value: e.stat,emoji: null, default: interaction.message.stat == e.stat})
  });
  const row = new MessageActionRow().addComponents(stat_options);

  let zprava = { components: [row, but1, but2, but3] }
  if (!img.id) zprava.files = [img]

  await interaction.editReply(zprava)
} catch (e) {
  console.log(e)
} finally {
  interaction.message.ready = true
  }
}

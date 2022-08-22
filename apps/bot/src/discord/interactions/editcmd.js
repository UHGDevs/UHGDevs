const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const canva = require('uhg-canvas')
const auth = ['378928808989949964', '312861502073995265', '379640544143343618']

module.exports = async (uhg, interaction) => {
if (!auth.includes(interaction.user.id)) return interaction.reply({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`Nemáš oprávnění`).setDescription('Nemáš práva měnit vzhled commandů').setColor('RED')] })
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
  } else if (action == 'modal' && arg == 'settings-graphic') {
    let apply = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_apply`).setLabel("Stat").setStyle('SHORT').setPlaceholder(interaction.message.stat + ' | global'));
    let color = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_color`).setLabel("Color - color code").setStyle('SHORT').setPlaceholder(' color code | null'));
    let font = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_font`).setLabel("Font").setStyle('SHORT').setPlaceholder(' Minecraft | any windows font | null'));
    let size = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_size`).setLabel("Font Size").setStyle('SHORT').setPlaceholder('20 | null'));
    let coords = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_coords`).setLabel("X/Y souřadnice").setStyle('SHORT').setPlaceholder('0, 0'));

    const modal = new Modal().setCustomId(`ECMD_${type}_set_settings-graphic`).setTitle(`Nastavení ${type} commandu`).addComponents([apply, color, font, size, coords])
    return await interaction.showModal(modal);
  } else if (action == 'set' && arg == 'settings-graphic') {
    let apply = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_apply`) || interaction.message.stat).toLowerCase()
    let color = interaction.fields.getTextInputValue(`ECMD_${type}_set_color`) || null
    let font = interaction.fields.getTextInputValue(`ECMD_${type}_set_font`) || null
    let size = interaction.fields.getTextInputValue(`ECMD_${type}_set_size`) || null
    let coords = interaction.fields.getTextInputValue(`ECMD_${type}_set_coords`) || null

    let stat = data.fields.find(n => n.stat.toLowerCase() == apply || n.name.toLowerCase() == apply) || {}
    
    if (size && size.includes(',')) size = size.split(',').map(n => Number(n)||20)
    if (coords) coords = coords.split(',').map(n => Number(n)||0)

    if (apply == 'global' || apply == 'default') {
      data.default.color = color ? (color.match(/null/i) ? data.default.color : color ) : data.default.color
      data.default.font = font ? (font.match(/null/i) ? data.default.font : font) : data.default.font
      data.default.size = size ? (String(size).match(/null/i) ? data.default.size : size) : data.default.size
      interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`SUCCESS`).setDescription('Úspěšně jsi změnil defaultní hodnoty! Klikni na <:true:1011238431482974278> pro uložení nebo na <:false:1011238405943865355> pro zrušení!').setColor('GREEN')] })
    } else if (!stat) {
      return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`ERROR`).setDescription('Použij prosím info settings pro vytvoření nového commandu').setColor('RED')] })
    } else {
      stat.color = color ? (color.match(/null/i) ? null : color ) : stat.color
      stat.size = size ? (String(size).match(/null/i) ? null : size) : stat.size
      stat.font = font ? (font.match(/null/i) ? null : font) : stat.font
      stat.x = coords ? (coords[0] || 0) : stat.x
      stat.y = coords ? (coords[1] || 0) : stat.y
    }

    img = await canva.run(data, api)
  } else if (action == 'modal' && arg == 'settings-info') {
    let apply = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_apply`).setLabel("Najít Stat").setStyle('SHORT').setPlaceholder(interaction.message.stat + ' | napsat \'new\' pro novy'));
    let editStat = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_stat`).setLabel("Stat").setStyle('SHORT').setPlaceholder('stat from uhg api'));
    let editName = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_name`).setLabel("Název").setStyle('SHORT').setPlaceholder('title'));
    let customText = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_customText`).setLabel("Custom Text").setStyle('SHORT').setPlaceholder('%%level%%/%%karma%%'));

    const modal = new Modal().setCustomId(`ECMD_${type}_set_settings-info`).setTitle(`Nastavení ${type} commandu`).addComponents([apply, editStat, editName, customText])
    return await interaction.showModal(modal);
  } else if (action == 'set' && arg == 'settings-info') {
    let apply = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_apply`) || interaction.message.stat).toLowerCase()
    let stat = data.fields.find(n => n.stat.toLowerCase() == apply || n.name.toLowerCase() == apply) || {}
    let apiStat = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_stat`) || stat.stat)
    let apiName = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_name`) || stat.name)
    let customText = interaction.fields.getTextInputValue(`ECMD_${type}_set_customText`) || stat.customText

    let newcmd = apply == 'new' ? true : false
    if (newcmd && data.fields.find(n => n.stat == apiStat)) return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`ERROR`).setDescription('Zadaný stat už je na obrázku!').setColor('RED')] })
    if (newcmd && (!apiStat || !apiName)) return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`ERROR`).setDescription('Nezadal jsi stat nebo jméno u nového commandu!').setColor('RED')] })
    stat.stat = apiStat || stat.stat
    stat.name = apiName || stat.apiName
    if (customText) stat.customText = customText
    stat.color = stat.color || null
    stat.font = stat.font || null
    stat.size = stat.size || null
    stat.x = stat.x || 0
    stat.y = stat.y || 0

    if (newcmd) {
      data.fields.push(stat)
      interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`SUCCESS`).setDescription(`${stat.name}: ${uhg.f(api.hypixel.stats[type] ? (api.hypixel.stats[game][stat.stat] || api.hypixel.stats[game]['overall'][stat.stat]) : api.hypixel[stat.stat] )}\n Nezapoměň se přepnout do commandu a po nastavení grafiky command uložit!`).setColor('GREEN')] })
    }
    console.log(data.fields)
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
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_modal_settings-graphic`).setStyle('SECONDARY').setEmoji('<:settings_graphic:1011333239434117130>'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_modal_settings-info`).setStyle('SECONDARY').setEmoji('<:settings_info:1011333260384665610>'));

const but2 = new MessageActionRow()
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_left`).setStyle('PRIMARY').setLabel('◄'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_krok`).setStyle('SECONDARY').setLabel(krok + ' px'))
  .addComponents(new MessageButton().setCustomId(`ECMD_${type}_move_right`).setStyle('PRIMARY').setLabel('►'))
  .addComponents(but_null(3))
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

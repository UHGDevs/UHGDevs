const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");
const { stat } = require("fs");
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

  /* --- Cooldown --- */
  if (action !== 'modal' && interaction.message.ready === false) return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`KLIKÁŠ MOC RYCHLE`).setDescription('Počkej než doběhne předchozí úkol').setColor('RED')] })
  else if (action === 'modal' && interaction.message.ready === false) return interaction.reply({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`KLIKÁŠ MOC RYCHLE`).setDescription('Počkej než doběhne předchozí úkol').setColor('RED')] })
  interaction.message.ready = false

  /* -- DISCARD command -- */
  if (action == 'set' && arg == 'discard') return interaction.editReply({ components: [] })

  /* -- DATA fetching -- */
  let data = interaction.message.cache || await uhg.mongo.run.get('general', 'commands', { _id: type }).then(n=> n[0] || null) || undefined
  if (!data) return
  if (!data._id) data._id = type

  /* -- API fetching -- */
  let api = interaction.message.api || await uhg.api.call(img.name.split('_')[0], ['hypixel', 'guild'])
  if (!api.success) return console.log(api)
  interaction.message.api = api

  /* -- define ACTIVE stat -- */
  interaction.message.stat = interaction.values ? interaction.values[0] : (interaction.message.components[0].components[0].options.find(n => n.default === true) ?  interaction.message.components[0].components[0].options.find(n => n.default === true).value : interaction.message.components[0].components[0].options[0].value)


  /* -- KROK (move px) -- */
  if (action == 'set' && arg == 'krok') {
    if (krok === 1) krok = 5
    else if (krok === 5) krok = 10
    else if (krok === 10) krok = 50
    else krok = 1
  }
  
  /* -- setup MODAL graphic settings -- */
  else if (action == 'modal' && arg == 'settings-graphic') {
    let stat = data.fields.find(n => n.stat == interaction.message.stat) || data.fields[0] || {}
    if (stat.stat) interaction.message.stat = stat.stat
    let apply = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_apply`).setLabel("Stat").setStyle('SHORT').setPlaceholder(interaction.message.stat + ' | global'));
    let color = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_color`).setLabel("Color - color code").setStyle('SHORT').setPlaceholder(`${stat.color || data.default.color} | null`));
    let font = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_font`).setLabel("Font").setStyle('SHORT').setPlaceholder(' Minecraft | any windows font | null'));
    let size = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_size`).setLabel("Font Size").setStyle('SHORT').setPlaceholder(`${stat.size || data.default.size} | null`));
    let coords = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_coords`).setLabel("X/Y souřadnice").setStyle('SHORT').setPlaceholder(`${stat.x}, ${stat.y}`));

    const modal = new Modal().setCustomId(`ECMD_${type}_set_settings-graphic`).setTitle(`Nastavení ${type} commandu`).addComponents([apply, color, font, size, coords])
    return await interaction.showModal(modal);
  }

  /* -- recieve MODAL graphic settings -- */
  else if (action == 'set' && arg == 'settings-graphic') {
    let apply = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_apply`) || interaction.message.stat).toLowerCase()
    let color = interaction.fields.getTextInputValue(`ECMD_${type}_set_color`) || null
    let font = interaction.fields.getTextInputValue(`ECMD_${type}_set_font`) || null
    let size = interaction.fields.getTextInputValue(`ECMD_${type}_set_size`) || null
    let coords = interaction.fields.getTextInputValue(`ECMD_${type}_set_coords`) || null

    let stat = data.fields.find(n => n.stat.toLowerCase() == apply || n.name.toLowerCase() == apply) || {}
    if (stat.stat) interaction.message.stat = stat.stat
    if (!data._id) data._id = type

    if (size && size.includes(',')) size = size.split(',').map(n => Number(n)||20)
    if (coords) coords = coords.split(',').map(n => Number(n)||0)

    if (apply == 'global' || apply == 'default') {
      data.default.color = color ? (color.match(/null/i) ? data.default.color : color ) : data.default.color
      data.default.font = font ? (font.match(/null/i) ? data.default.font : font) : data.default.font
      data.default.size = size ? (String(size).match(/null/i) ? data.default.size : size) : data.default.size
      interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`SUCCESS`).setDescription('Úspěšně jsi změnil defaultní hodnoty! Klikni na <:true:1011238431482974278> pro uložení nebo na <:false:1011238405943865355> pro zrušení!').setColor('GREEN')] })
    } else if (!stat.stat) {
      return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`ERROR`).setDescription('Použij prosím info settings pro vytvoření nového commandu').setColor('RED')] })
    } else {
      stat.color = color ? (color.match(/null/i) ? null : color ) : stat.color
      stat.size = size ? (String(size).match(/null/i) ? null : size) : stat.size
      stat.font = font ? (font.match(/null/i) ? null : font) : stat.font
      stat.x = coords ? (coords[0] || 0) : stat.x
      stat.y = coords ? (coords[1] || 0) : stat.y
    }
    img = await canva.run(data, api)
  }
  
  /* -- setup MODAL info settings -- */
  else if (action == 'modal' && arg == 'settings-info') {
    let stat = data.fields.find(n => n.stat == interaction.message.stat) || data.fields[0] || {}
    if (stat.stat) interaction.message.stat = stat.stat
    
    let apply = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_apply`).setLabel("Najít Stat").setStyle('SHORT').setPlaceholder(interaction.message.stat + ' | napsat \'new\' pro novy'))
    let editStat = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_stat`).setLabel("Stat").setStyle('SHORT').setPlaceholder('stat from uhg api'));
    let editName = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_name`).setLabel("Název").setStyle('SHORT').setPlaceholder(stat.name));
    let path = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_path`).setLabel("Api Path").setStyle('SHORT').setPlaceholder('hypixel/stats/bedwars/overall'));
    let customText = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`ECMD_${type}_set_customText`).setLabel("Custom Text").setStyle('SHORT').setPlaceholder(stat.customText || '%%hypixel/level%%/%%hypixel/karma%%'));
    

    const modal = new Modal().setCustomId(`ECMD_${type}_set_settings-info`).setTitle(`Nastavení ${type} commandu`).addComponents([apply, editStat, editName, path, customText])
    return await interaction.showModal(modal);
  }
  /* -- recieve MODAL graphic settings -- */
  else if (action == 'set' && arg == 'settings-info') {
    let apply = String(interaction.fields.getTextInputValue(`ECMD_${type}_set_apply`) || interaction.message.stat).toLowerCase()

    let newcmd = false
    let stat = data.fields.find(n => n.stat.toLowerCase() == apply || n.name.toLowerCase() == apply) || {}
    if (!stat.stat) newcmd = true

    let apiStat = interaction.fields.getTextInputValue(`ECMD_${type}_set_stat`) || stat.stat || null
    let apiName = interaction.fields.getTextInputValue(`ECMD_${type}_set_name`) || stat.name || null
    let path = interaction.fields.getTextInputValue(`ECMD_${type}_set_path`) || stat.path || null
    let customText = interaction.fields.getTextInputValue(`ECMD_${type}_set_customText`) || stat.customText || null

    if (newcmd && data.fields.find(n => n.stat == apiStat)) return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`ERROR`).setDescription('Zadaný stat už je na obrázku!').setColor('RED')] })
    if (newcmd && (!apiStat || !apiName || !path)) return interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`ERROR`).setDescription('Nezadal jsi stat, jméno nebo path u nového commandu!').setColor('RED')] })

    interaction.message.stat = apiStat

    stat.stat = apiStat
    stat.name = apiName
    stat.path = path
    stat.customText = customText
    stat.color = stat.color || null
    stat.font = stat.font || null
    stat.size = stat.size || null
    stat.x = stat.x || 0
    stat.y = stat.y || 0
    if (customText === 'null' || !customText) delete stat.customText

    if (newcmd) {
      data.fields.push(stat)
      interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`SUCCESS`).setDescription(`${stat.name}: ${uhg.f(api.hypixel.stats[type] ? (api.hypixel.stats[game][stat.stat] || api.hypixel.stats[game]['overall'][stat.stat]) : api.hypixel[stat.stat] )}\n Nezapoměň se přepnout do commandu a po nastavení grafiky command uložit!`).setColor('GREEN')] })
    }
    
    img = await canva.run(data, api)
  }

  /* -- save current EDIT settings -- */
  else if (action == 'set' && arg == 'save') {
    await uhg.mongo.run.post('general', 'commands', data)
    //interaction.editReply({ components: [] })
    //return
    interaction.followUp({ ephemeral: true, embeds: [new MessageEmbed().setTitle(`SUCCESS`).setDescription(`Saved current design!`).setColor('GREEN')] })
  }
  
  /* -- sync settings from DATABAZE -- */
  else if (action == 'set' && arg == 'sync') {
    data = await uhg.mongo.run.get('general', 'commands', { _id: type }).then(n=> n[0] || null)
    img = await canva.run(data, api)
  }

  /* -- view STAT settings -- */
  else if (action == 'get' && arg == 'info') {
    let stat = data.fields.find(n => n.stat == interaction.message.stat)
    let info = `Coords: ${stat.x}, ${stat.y}`
    if (stat.color !== undefined) info = info + `\nColor: ${stat.color ? stat.color : ('Default - ' + data.default.color)}`
    if (stat.font !== undefined) info = info + `\nFont: ${stat.font ? stat.font : ('Default - ' + data.default.font)}`
    if (stat.size !== undefined) info = info + `\nSize: ${stat.size ? stat.size : ('Default - ' + data.default.size)}\n`

    info = info + `\nCustom: ${stat.custom ? '✅':'🟥'}`
    if (stat.customText) info = info + `\nCustom Text: \`${stat.customText}\``

    let info_e = new MessageEmbed().setTitle(`${stat.name} v ${type} commandu`).setColor('#ff51fd').setDescription(info)
    interaction.followUp({ ephemeral: true, embeds: [info_e] })
  } 

  /* -- move STAT around the picture -- */
  else if (action == 'move') {
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
    .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_sync`).setStyle('SECONDARY').setEmoji('<:refresh:1011620798278160384>'))
    .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_discard`).setStyle('DANGER').setEmoji('<:false:1011238405943865355>'))
    .addComponents(new MessageButton().setCustomId(`ECMD_${type}_set_save`).setStyle('SUCCESS').setEmoji('<:true:1011238431482974278>'));

  let selectmenu = new MessageSelectMenu().setCustomId(`ECMD_${type}_set`).addOptions(data.fields.map(e => {return {label: e.name, value: e.stat, emoji: null, default: e.stat == interaction.message.stat}}))

  const row = new MessageActionRow().addComponents(selectmenu);
  let zprava = { components: [row, but1, but2, but3] }
  if (img && !img.id) zprava.files = [img]

  await interaction.editReply(zprava)
} catch (e) {
  console.log(e)
} finally {
  interaction.message.ready = true
  }
}

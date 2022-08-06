const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const commands = require('../../settings/values/commands')

module.exports = async (uhg, interaction) => {
  let command = interaction.options.getString('command')
  let focused = interaction.options._hoistedOptions.filter(n => n.focused)[0]

  let id = interaction.member.user.id
  let uhg_guild = uhg.dc.client.guilds.cache.get('455751845319802880')
  let guild_member = uhg_guild.members.cache.get(id)

  let respond = []

  try {
    if (focused.name == 'command') {

      uhg.dc.loot.forEach(n => {
        if ( n.allowedids.includes(id) || (guild_member && n.allowedroles.some(a => guild_member._roles.includes(a) )) || n.allowedroles.some(a => interaction.member._roles.includes(a) ) || (!n.allowedroles.length && !n.allowedids.length)) respond.push(n.queue)
      });

      respond = respond.sort((a,b) => a.sort - b.sort)
      if (!respond.length) respond.push(commands.notmember)
      return interaction.respond(respond)

    } else if (focused.name == 'option1') {

    }

  } catch (e) {
    console.log(String(e.stack).bgRed)
    return interaction.respond([ {name: 'Error! zkus to prosím zachvíli, bot se zapíná', value: 'err' } ])
  }

}

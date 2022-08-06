const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow, Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'loot',
  description: 'Brand new GEXP LOOT BOXES',
  permissions: [ { id: '378928808989949964', type: 'USER', permission: true} ],
  options: [
    {
      name: "command",
      description: "Vyber si command",
      type: "STRING",
      required: true,
      autocomplete: true
    },
    {
      name: 'visibility',
      description: 'Chceš, aby odpověď byla viditělná pro ostatní?',
      type: 'BOOLEAN',
      required: false
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    let ephemeral = !interaction.options.getBoolean('visibility')
    await interaction.deferReply({ ephemeral: ephemeral }).catch(() => {});
    try {
      let command = interaction.options.getString('command')

      if (command == 'notmember') return interaction.editReply({ content: 'WUT? Co to je za command?' })
      else if (command == 'err') return interaction.editReply({ content: 'Počkej prosím chvíli (než se zapne bot)' })

      let cmd = uhg.dc.loot.get(command)
      if (!cmd) return interaction.editReply({ content: 'Tento command neznám :/' })
      let guild_member = uhg.dc.client.guilds.cache.get('455751845319802880').members.cache.get(interaction.user.id)
      if (!(cmd.allowedids.includes(interaction.user.id) || (guild_member && cmd.allowedroles.some(a => guild_member._roles.includes(a) )) || cmd.allowedroles.some(a => interaction.member._roles.includes(a) ) || (!cmd.allowedroles.length && !cmd.allowedids.length))) return interaction.editReply({ content: 'Do not try to hack in! But nice try!' })

      if (cmd) cmd.run(uhg, interaction)
      else interaction.editReply({ content: 'coming soon' })
      return
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return 'Chyba v loot slash příkazu!'
    }
  }
}

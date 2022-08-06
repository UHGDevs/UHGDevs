const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'cmd',
  description: 'Cool commands (even some in-game commands)',
  permissions: [],
  options: [
    {
      name: "command",
      description: "Vyber si command",
      type: "STRING",
      required: true,
      autocomplete: true
    },
    {
      name: 'player',
      description: 'Napiš jméno nebo uuid hráče',
      type: 'STRING',
      required: false,
      //autocomplete: true
    },
    {
      name: 'user',
      description: 'Vyber hráče na discordu',
      type: 'USER',
      required: false,
      //autocomplete: true
    },
    {
      name: 'amount',
      description: 'pocet na odstranenie?',
      type: 'NUMBER',
      required: false
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
    try {
      let command = interaction.options.getString('command')
      if (command == 'verify') return require(`../interactions/modal/verify.js`).send(uhg, interaction)

      await interaction.deferReply({ ephemeral: ephemeral }).catch(() => {});

      if (command == 'notmember') return interaction.editReply({ content: 'Připoj se do UHG, nebo si nějak jinak sežeň commandy!!' })
      else if (command == 'err') return interaction.editReply({ content: 'Počkej prosím chvíli (než se zapne bot)' })

      let cmd = uhg.dc.cmd.get(command)
      if (!cmd) return interaction.editReply({ content: 'Nevymýšlej si :D' })
      let guild_member = uhg.dc.client.guilds.cache.get('455751845319802880').members.cache.get(interaction.user.id)
      if (!(cmd.allowedids.includes(interaction.user.id) || (guild_member && cmd.allowedroles.some(a => guild_member._roles.includes(a) )) || cmd.allowedroles.some(a => interaction.member._roles.includes(a) ) || (!cmd.allowedroles.length && !cmd.allowedids.length))) return interaction.editReply({ content: 'Do not try to hack in! But nice try!' })

      if (cmd) cmd.run(uhg, interaction)
      else interaction.editReply({ content: 'coming soon' })
      return

    } catch (e) {
        console.log(String(e.stack).bgRed)
        return 'Chyba v cmd slash příkazu!'
    }
  }
}

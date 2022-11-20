const { exec } = require('child_process');

module.exports = {
    name: 'github',
    description: 'Special command for devs!',
    permissions: [ {id: '378928808989949964', type: 'USER', permission: true} ],
    options: [
      {
        name: 'command',
        description: 'Any idea what this does?',
        type: 3,
        required: true,
        choices: [
          { value: 'pull --autostash', name: 'Pull with autostash' },
          { value: 'pull --rebase', name: 'Pull with rebarse' },
          { value: 'diff --name-only', name: 'See local changes' },
          { value: 'stash', name: 'Stash' },
          { value: 'stash clear', name: 'Clear stash' },
        ]
      },
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: true })

      let command = 'git ' + interaction.options.getString('command')

      await exec(command, { shell: true }, (error, result) => {
        if (error && !result) interaction.editReply({ content: `Error: ${error}` })
        else if (!error && result) interaction.editReply({ content: `Success: ${result}` })
        else if (error && result) interaction.editReply({ content: `Error: ${error}\nMessage: ${result}` })
        else interaction.editReply({ content: `Žádná odpověď` })
      });

    }
}
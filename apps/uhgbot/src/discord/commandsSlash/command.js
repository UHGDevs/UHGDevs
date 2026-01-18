/**
 * src/discord/commandsSlash/command.js
 * Informace o příkazech a jejich správa (Reload).
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: 'command',
    description: 'Zobrazí informace o příkazu a umožní jeho reload',
    permissions: [
        { type: 'USER', id: '378928808989949964' }, // DavidCzPdy
        { type: 'USER', id: '312861502073995265' }  // Farmans
    ],
    options: [
        {
            name: 'name',
            description: 'Název příkazu',
            type: 3, // STRING
            required: true,
            autocomplete: true
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const cmdName = interaction.options.getString('name');
        
        // 1. Hledáme v Slash příkazech i klasických příkazech
        const slashCmd = uhg.dc.slash.get(cmdName);
        const msgCmd = uhg.dc.commands.get(cmdName);
        const cmd = slashCmd || msgCmd;

        if (!cmd) {
            return interaction.editReply({ content: `❌ Příkaz \`${cmdName}\` nebyl nalezen.` });
        }

        const type = slashCmd ? 'Slash (/) Command' : 'Message (!.) Command';
        
        // 2. Sestavení Embedu
        const embed = new uhg.dc.Embed()
            .setTitle(`Informace o příkazu: ${cmd.name}`)
            .setDescription(cmd.description || "Bez popisu")
            .setColor(0x55FFFF)
            .addFields(
                { name: 'Typ', value: type, inline: true },
                { name: 'Aliasy', value: cmd.aliases ? cmd.aliases.join(', ') : 'Žádné', inline: true }
            );

        // 3. Získání ID pro klikatelnou zmínku (pouze pro Slash)
        if (slashCmd) {
            // Zkusíme najít ID v globálních nebo guild příkazech
            let discordCmd = await uhg.dc.client.application.commands.fetch().then(cmds => cmds.find(c => c.name === cmd.name));
            if (!discordCmd && interaction.guild) {
                discordCmd = await interaction.guild.commands.fetch().then(cmds => cmds.find(c => c.name === cmd.name));
            }

            if (discordCmd) {
                embed.addFields({ name: 'Syntax', value: `</${cmd.name}:${discordCmd.id}>`, inline: false });
                embed.setFooter({ text: `ID: ${discordCmd.id}` });
            } else {
                embed.addFields({ name: 'Syntax', value: `/${cmd.name}`, inline: false });
            }
        } else {
            embed.addFields({ name: 'Syntax', value: `${uhg.config.prefix}${cmd.name}`, inline: false });
        }

        // 4. Výpis oprávnění
        if (cmd.permissions && cmd.permissions.length > 0) {
            const permsText = cmd.permissions.map(p => {
                if (p.type === 'USER') return `👤 <@${p.id}>`;
                if (p.type === 'ROLE') return `🛡️ <@&${p.id}>`;
                return `❓ ${p.id}`;
            }).join('\n');
            embed.addFields({ name: 'Oprávnění', value: permsText, inline: false });
        } else {
            embed.addFields({ name: 'Oprávnění', value: "✅ Veřejný", inline: false });
        }

        // 5. Tlačítko pro Reload
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`command_reload_${cmd.name}`)
                .setLabel('RELOAD')
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({ embeds: [embed], components: [buttons] });
    },

    /**
     * Našeptávač příkazů (hledá ve všech kolekcích)
     */
    autocomplete: async (uhg, interaction) => {
        const focused = interaction.options.getFocused().toLowerCase();
        
        // Spojíme názvy slash i message příkazů
        const allCommands = [
            ...uhg.dc.slash.map(c => ({ name: `/${c.name}`, value: c.name })),
            ...uhg.dc.commands.map(c => ({ name: `${uhg.config.prefix}${c.name}`, value: c.name }))
        ];

        // Filtrování (max 25 výsledků pro Discord API)
        const filtered = allCommands
            .filter(c => c.name.toLowerCase().includes(focused) || c.value.toLowerCase().includes(focused))
            .slice(0, 25);

        await interaction.respond(filtered);
    },

    /**
     * Logika tlačítka Reload
     */
    reload: async (uhg, interaction) => {
        // Kontrola práv (použijeme práva definovaná v tomto souboru nahoře)
        if (!uhg.handlePerms(module.exports.permissions, interaction)) {
            return interaction.reply({ content: "Nemáš právo reloadovat příkazy.", flags: [MessageFlags.Ephemeral] });
        }

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        try {
            const cmdName = interaction.customId.split('_')[2];
            console.log(` [SYSTEM] `.bgYellow.black + ` Reload příkazů vyžádán uživatelem ${interaction.user.username}...`.yellow);

            // Zavoláme hlavní reload metodu z CommandHandleru
            const result = await uhg.cmds.reload();

            await interaction.editReply({ content: `✅ **Reload dokončen!**\n${result}` });
        } catch (e) {
            console.error(e);
            await interaction.editReply({ content: `❌ Chyba při reloadu: ${e.message}` });
        }
    }
};
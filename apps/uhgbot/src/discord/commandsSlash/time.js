/**
 * src/discord/commandsSlash/time.js
 */
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'time',
    description: 'Time Event GUI - správa automatických úkolů',
    permissions: [{ type: 'USER', id: '378928808989949964' }],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const options = uhg.time.events.map(ev => {
            const toggle = uhg.config.time[ev.name];
            return {
                label: `${ev.name}${toggle ? ' ✅' : ''}`,
                description: ev.description.slice(0, 100),
                value: ev.name,
                emoji: ev.emoji || '⏰'
            };
        });

        const embed = new uhg.dc.Embed()
            .setTitle('⏱️ Time Events GUI')
            .setColor(0x55FFFF)
            .setDescription(uhg.time.events.map(ev => {
                const toggle = uhg.config.time[ev.name];
                const timeStr = ev.executedAt ? `<t:${Math.round(ev.executedAt.getTime()/1000)}:R>` : 'nikdy';
                return `${ev.emoji || '⏰'} ${toggle ? `**${ev.name}**` : ev.name} (poslední: ${timeStr})`;
            }).join('\n'))
            .setFooter({ text: `${uhg.time.events.size} úkolů celkem` });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('time_gui').setPlaceholder('Vyber event pro detaily').addOptions(options)
        );

        await interaction.editReply({ embeds: [embed], components: [menu] });
    },

    gui: async (uhg, interaction) => {
        const type = interaction.values ? interaction.values[0] : interaction.customId.split('_')[2];
        const event = uhg.time.events.get(type);
        if (!event) return interaction.reply({ content: "Event nenalezen.", flags: [MessageFlags.Ephemeral] });

        const toggle = uhg.config.time[event.name];
        
        // --- VÝPOČET STAVU BĚHU ---
        let statusValue = '💤 Čeká';
        if (!uhg.time.ready[event.name]) {
            const runningTime = (Date.now() - event.executedAt.getTime()) / 1000;
            statusValue = `👟 Běží (${uhg.f(runningTime)}s)`;
        }
        // ---------------------------

        const embed = new uhg.dc.Embed()
            .setTitle(`${event.emoji || '⏰'} Detail: ${event.name}`)
            .setColor(toggle ? "Green" : "Red")
            .setDescription(event.description)
            .addFields(
                { name: 'Stav v configu', value: toggle ? '✅ Zapnuto' : '🟥 Vypnuto', inline: true },
                { name: 'Pohotovost', value: statusValue, inline: true },
                { name: 'Cron perioda', value: `\`${event.time}\``, inline: true },
                { name: 'Statistiky', value: `Spuštěno: \`${event.count || 0}x\`\nPoslední: \`${uhg.f(event.lastTime/1000)}s\`\nPrůměr: \`${uhg.f(event.averageTime/1000)}s\``, inline: false }
            );

        if (event.errors?.length) {
            embed.addFields({ name: '⚠️ Poslední chyby', value: event.errors.map(e => `${e.name}: ${e.value}`).join('\n').slice(0, 1024) });
        }

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`time_toggle_${event.name}`).setLabel(toggle ? 'VYPNOUT' : 'ZAPNOUT').setStyle(toggle ? ButtonStyle.Danger : ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`time_execute_${event.name}`).setLabel('SPUSTIT').setStyle(ButtonStyle.Primary).setDisabled(!uhg.time.ready[event.name]),
            new ButtonBuilder().setCustomId(`time_refresh_${event.name}`).setLabel('OBNOVIT').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`time_back_none`).setLabel('ZPĚT').setStyle(ButtonStyle.Secondary)
        );

        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            await interaction.update({ embeds: [embed], components: [buttons] });
        }
    },

    refresh: async (uhg, interaction) => module.exports.gui(uhg, interaction),
    
    toggle: async (uhg, interaction) => {
         const name = interaction.customId.split('_')[2];
        
        uhg.config.time[name] = !uhg.config.time[name];
        
        interaction.values = [name];
        return module.exports.gui(uhg, interaction);
    },

    execute: async (uhg, interaction) => {
        const name = interaction.customId.split('_')[2];
        const event = uhg.time.events.get(name);
        await interaction.reply({ content: `▶️ Spouštím \`${name}\`...`, flags: [MessageFlags.Ephemeral] });
        try {
            await uhg.time.executeEvent(event);
            await interaction.editReply({ content: `✅ Hotovo.` });
        } catch (e) {
            await interaction.editReply({ content: `❌ Chyba: ${e.message}` });
        }
    },

    back: async (uhg, interaction) => module.exports.run(uhg, interaction)
};
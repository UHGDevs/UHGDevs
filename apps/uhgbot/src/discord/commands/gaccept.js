module.exports = {
    name: "gaccept",
    description: 'Zobrazí seznam badges nebo zkontroluje hráče',
    permissions: [
        { type: 'USER', id: '378928808989949964' },
        { type: 'ROLE', id: '530504766225383425' },
        { type: 'ROLE', id: '537252847025127424' },
        { type: 'ROLE', id: '475585340762226698' },
        { type: 'ROLE', id: '530504567528620063' },
    ],
    run: async (uhg, message) => {
        const embed = new uhg.dc.Embed()
            .setTitle("Nová žádost o vstup!")
            .setColor("Yellow")
            .setDescription(`**Hráč:** ${uhg.dontFormat("DavidCzPdy")}\n**Level:** ${"20000"}\n**Discord:** ${'Technoblade'}`);
        
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`gaccept_accept_davidczpdy`).setLabel('PŘIJMOUT').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`gaccept_deny_davidczpdy`).setLabel('ODMÍTNOUT').setStyle(ButtonStyle.Danger)
        );
        await message.channel.send({ embeds: [embed], components: [buttons] });
    },
        accept: async (uhg, interaction) => {
        const target = interaction.customId.split('_')[2]; // Získáme Nick z ID

        // Pošleme příkaz do hry
        uhg.minecraft.send(`/g accept ${target}`);

        const originalEmbed = interaction.message.embeds[0];
        const embed = new uhg.dc.Embed(originalEmbed.data)
            .setColor("Green") // Změna na zelenou
            .setTitle(`✅ Žádost přijata - ${target}`)
            .setFooter({ 
                text: `Přijal: ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        // Odpovíme na Discordu
        await interaction.update({ 
            content: `⌛ Pokouším se přijmout **${target}**... (Pokud žádost vypršela, bot ho automaticky pozve)`, 
            components: [], 
            embeds: [embed] 
        });
    },

    /**
     * Spustí se při kliknutí na tlačítko gaccept_deny_Nick
     */
    deny: async (uhg, interaction) => {
        const target = interaction.customId.split('_')[2];

        // Do hry nic neposíláme (ignorujeme žádost), jen update na Discordu
        await interaction.update({ 
            content: `❌ Žádost hráče **${target}** byla zamítnuta uživatelem ${interaction.user.username}.`, 
            components: [], 
            embeds: interaction.message.embeds 
        });
    }
};
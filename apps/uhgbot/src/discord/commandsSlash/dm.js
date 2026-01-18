/**
 * src/discord/commandsSlash/dm.js
 * Hromadné odesílání soukromých zpráv (DMs) podle role.
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'dm',
    description: 'Pošle hromadnou DM zprávu všem členům s určitou rolí',
    permissions: [
        { type: 'USER', id: '378928808989949964' }, // DavidCzPdy
        { type: 'USER', id: '312861502073995265' }  // Farmans
    ],
    options: [
        {
            name: 'role',
            description: 'Komu mám zprávu poslat?',
            type: 8, // ROLE
            required: true
        },
        {
            name: 'zprava',
            description: 'Obsah zprávy',
            type: 3, // STRING
            required: true
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const role = interaction.options.getRole('role');
        const messageContent = interaction.options.getString('zprava');

        // 1. ZÍSKÁNÍ ČLENŮ
        // Musíme načíst všechny členy (fetch), protože cache nemusí být kompletní
        await interaction.guild.members.fetch();
        
        // Filtrujeme členy s rolí (a ignorujeme boty)
        const targets = role.members.filter(m => !m.user.bot);
        
        if (targets.size === 0) {
            return interaction.editReply(`❌ Role **${role.name}** nemá žádné členy (kromě botů).`);
        }

        await interaction.editReply(`🔄 Začínám odesílat zprávy **${targets.size}** uživatelům...\nTohle může chvíli trvat.`);

        // 2. SESTAVENÍ ZPRÁVY PRO UŽIVATELE
        const dmEmbed = new uhg.dc.Embed()
            .setTitle(`Zpráva z ${interaction.guild.name}`)
            .setColor(0x55FFFF)
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(messageContent)
            .setFooter({ text: `Zpráva pro roli: @${role.name} | Odeslal: ${interaction.user.username}` })
            .setTimestamp();

        // 3. ODESÍLACÍ SMYČKA
        let success = 0;
        let failed = [];

        for (const [id, member] of targets) {
            try {
                await member.send({ embeds: [dmEmbed] });
                success++;
            } catch (e) {
                // Nejčastější chyba: Uživatel má vypnuté DMs od cizích lidí
                failed.push(member.user.username);
            }
            
            // Bezpečnostní pauza 0.5s, aby nás Discord nezablokoval za spam
            await uhg.delay(500); 
        }

        // 4. VÝSLEDEK PRO ADMINA
        const resultEmbed = new uhg.dc.Embed()
            .setTitle("📨 Hromadná zpráva odeslána")
            .setColor(failed.length > 0 ? "Orange" : "Green")
            .addFields(
                { name: "Cílová role", value: `${role}`, inline: true },
                { name: "Úspěšně", value: `✅ ${success}`, inline: true },
                { name: "Selhalo", value: `❌ ${failed.length}`, inline: true },
                { name: "Obsah", value: messageContent.slice(0, 1024), inline: false }
            );

        if (failed.length > 0) {
            // Pokud je chyb málo, vypíšeme jména. Pokud moc, jen počet.
            const failedList = failed.length > 40 ? `${failed.slice(0, 40).join(', ')} ... a dalších ${failed.length - 40}` : failed.join(', ');
            resultEmbed.addFields({ name: "Nepodařilo se odeslat", value: `\`${failedList}\`\n*(Mají vypnuté soukromé zprávy)*` });
        }

        await interaction.editReply({ content: null, embeds: [resultEmbed] });

        const logChannel = uhg.dc.cache.channels.get('logs');
        if (logChannel) {
            logChannel.send({ 
                content: `📢 **DM ANNOUNCEMENT** od ${interaction.user}`, 
                embeds: [resultEmbed] 
            });
        }
    }
};
/**
 * src/discord/commandsSlash/verify.js
 */
const { 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    ModalBuilder, TextInputBuilder, TextInputStyle, 
    MessageFlags 
} = require('discord.js');

module.exports = {
    name: 'verify',
    description: 'Propojení Discord účtu s Hypixel účtem',
    permissions: [],
    options: [
        {
            name: 'nickname',
            description: 'Tvůj Minecraft nick',
            type: 3, // STRING
            required: false
        },
        {
            name: 'target',
            description: '(Admin) Uživatel pro custom verifikaci',
            type: 6, // USER
            required: false
        },
        {
            name: 'setup',
            description: '(Admin) Pošle verifikační embed do kanálu',
            type: 3, // STRING
            required: false,
            choices: [{ name: 'Odeslat Embed', value: 'send' }]
        }
    ],

    run: async (uhg, interaction) => {
        const setup = interaction.options.getString('setup');
        const nickname = interaction.options.getString('nickname');
        const targetUser = interaction.options.getUser('target');

        // A. ADMIN SETUP
        if (setup === 'send') {
            if (!uhg.handlePerms([{ type: 'USER', id: '378928808989949964' }, { type: 'ROLE', id: '530504567528620063' }], interaction)) {
                return interaction.reply({ content: 'Nemáš práva na setup.', flags: [MessageFlags.Ephemeral] });
            }

            const embed = new uhg.dc.Embed()
                .setTitle('✅ UHG Verifikace')
                .setColor(0x55FFFF)
                .setDescription(
                    'Pro získání přístupu na server a propojení statistik se musíš verifikovat.\n\n' +
                    '**Postup:**\n' +
                    '1. Jdi na Hypixel server (`mc.hypixel.net`).\n' +
                    '2. Jdi do **My Profile** (hlava v hotbaru) -> **Social Media**.\n' +
                    '3. Nastav **Discord** na tvůj aktuální Discord nick: `' + interaction.user.username + '`\n' +
                    '4. Klikni na tlačítko **VERIFY** níže.'
                )
                .setThumbnail('https://i.imgur.com/3QZ7XqK.png');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_modalOpen')
                    .setLabel('VERIFY')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: 'Verifikační zpráva odeslána.', flags: [MessageFlags.Ephemeral] });
        }

        // B. CUSTOM VERIFY (ADMIN)
        if (targetUser && nickname) {
             if (!uhg.handlePerms([{ type: 'USER', id: '378928808989949964' }, { type: 'ROLE', id: '530504567528620063' }], interaction)) {
                return interaction.reply({ content: 'Nemáš práva na custom verify.', flags: [MessageFlags.Ephemeral] });
            }
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            // Voláme proces s parametrem bypass = true
            return await verifyProcess(uhg, interaction, nickname, targetUser, true);
        } else if (targetUser && !nickname) {
            return interaction.reply({ content: 'Pro custom verify musíš zadat i nickname!', flags: [MessageFlags.Ephemeral] });
        }

        // C. RUČNÍ VERIFIKACE (Self)
        if (nickname) {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            return await verifyProcess(uhg, interaction, nickname, interaction.user, false);
        }

        // D. NÁPOVĚDA
        return interaction.reply({ 
            content: 'Použij `/verify [nickname]` nebo klikni na tlačítko v #verify kanálu.', 
            flags: [MessageFlags.Ephemeral] 
        });
    },

    modalOpen: async (uhg, interaction) => {
        const modal = new ModalBuilder()
            .setCustomId('verify_modalSubmit')
            .setTitle('Verifikace účtu');

        const input = new TextInputBuilder()
            .setCustomId('nickname')
            .setLabel("Tvůj Minecraft Nickname")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Např. DavidCzPdy")
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(16);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },

    modalSubmit: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const nickname = interaction.fields.getTextInputValue('nickname');
        await verifyProcess(uhg, interaction, nickname, interaction.user, false);
    },

    // Kompatibilita se starým tlačítkem
    create: async (uhg, interaction) => module.exports.modalOpen(uhg, interaction)
};

/**
 * Hlavní verifikační logika
 * @param {object} interaction 
 * @param {string} nickname - Minecraft jméno
 * @param {object} discordUser - Discord uživatel (objekt)
 * @param {boolean} bypassCheck - Pokud true, nekontroluje propojení na Hypixelu (Custom verify)
 */
async function verifyProcess(uhg, interaction, nickname, discordUser, bypassCheck) {
    try {
        // 1. Získání dat z API
        const api = await uhg.api.call(nickname, ["hypixel", "guild"]);
        
        if (!api.success) {
            return interaction.editReply(`❌ Hráč **${nickname}** nebyl nalezen (Mojang API).`);
        }

        const hypixel = api.hypixel;

        // 2. Kontrola propojení (pokud není bypass)
        if (!bypassCheck) {
            if (!hypixel || !hypixel.links || !hypixel.links.DISCORD) {
                return interaction.editReply(`❌ Hráč **${api.username}** nemá na Hypixelu propojený Discord!\n\nPostupuj podle návodu.`);
            }

            const linkedDiscord = hypixel.links.DISCORD.toLowerCase();
            const username = discordUser.username.toLowerCase();
            const tag = discordUser.tag.toLowerCase(); 

            // Kontrola shody
            if (linkedDiscord !== username && linkedDiscord !== tag) {
                return interaction.editReply(
                    `❌ Verifikace selhala!\n\n` +
                    `Na Hypixelu je: \`${hypixel.links.DISCORD}\`\n` +
                    `Tvůj Discord: \`${discordUser.username}\`\n\n` +
                    `Musí se shodovat.`
                );
            }
        }

        // 3. Uložení do DB
        const verifyData = {
            _id: discordUser.id,
            uuid: api.uuid,
            nickname: api.username,
            names: api.names || [],
            date: api.date || new Date(),
            verifiedAt: Date.now()
        };
        
        // Zde voláme nově přidanou metodu
        await uhg.db.updateVerify(discordUser.id, verifyData);
        
        // Uložení stats
        if (hypixel) await uhg.db.saveStats(api.uuid, hypixel);

        // 4. Role a Nickname
        let msg = `✅ **${bypassCheck ? 'Custom verifikace' : 'Verifikace'} úspěšná!**\nDiscord **${discordUser.username}** propojen s **${api.username}**.\n`;

       try {
            await uhg.roles.updateMember(interaction.user.id);
            msg += `🔹 Role a statistiky byly aktualizovány.\n`;
        } catch (e) {
            console.error("Chyba při updateMember:", e);
        }

        await interaction.editReply({ content: msg, embeds: [] });

        // Log
        const logChannel = uhg.dc.cache.channels.get('logs');
        if (logChannel) {
            logChannel.send(`🔐 **VERIFY:** ${interaction.user.username} verifikoval ${discordUser.username} jako **${api.username}** ${bypassCheck ? '(FORCE)' : ''}.`);
        }

    } catch (e) {
        console.error("Verify Error:", e);
        return interaction.editReply("❌ Nastala interní chyba při verifikaci.");
    }
}
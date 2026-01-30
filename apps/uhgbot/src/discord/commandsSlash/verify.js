/**
 * src/discord/commandsSlash/verify.js
 */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');

module.exports = {
    name: 'verify',
    description: 'Propojení Discord účtu s Hypixel účtem',
    options: [
        { name: 'nickname', description: 'Tvůj Minecraft nick', type: 3, required: false },
        { name: 'target', description: '(Admin) Uživatel pro custom verifikaci', type: 6, required: false },
        { name: 'setup', description: '(Admin) Pošle verifikační embed do kanálu', type: 3, required: false, choices: [{ name: 'Odeslat Embed', value: 'send' }] }
    ],

    run: async (uhg, interaction) => {
        const setup = interaction.options.getString('setup');
        const nickname = interaction.options.getString('nickname');
        const targetUser = interaction.options.getUser('target');

        // 1. ADMIN SETUP (Odeslání zprávy s tlačítkem)
        if (setup === 'send') {
            if (!uhg.handlePerms([{ type: 'USER', id: '378928808989949964' }, { type: 'ROLE', id: '537252847025127424' }], interaction)) {
                return interaction.reply({ content: 'Nemáš práva na setup.', flags: [MessageFlags.Ephemeral] });
            }

            const embed = new uhg.dc.Embed()
                .setTitle('✅ UHG Verifikace')
                .setColor(0x55FFFF)
                .setDescription('Pro přístup na server se musíš verifikovat.\n\n**Postup:**\n1. Jdi na Hypixel -> **Social Media**.\n2. Nastav Discord na: `' + interaction.user.username + '`\n3. Klikni na tlačítko níže.');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('verify_modalOpen').setLabel('VERIFY').setStyle(ButtonStyle.Success).setEmoji('✅')
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            return interaction.reply({ content: 'Zpráva odeslána.', flags: [MessageFlags.Ephemeral] });
        }

        // 2. CUSTOM VERIFY (Admin force)
        if (targetUser && nickname) {
             if (!uhg.handlePerms([{ type: 'USER', id: '378928808989949964' }], interaction)) {
                return interaction.reply({ content: 'Nemáš práva na custom verify.', flags: [MessageFlags.Ephemeral] });
            }
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            return await verifyProcess(uhg, interaction, nickname, targetUser, true);
        }

        // 3. RUČNÍ VERIFIKACE (Self)
        if (nickname) {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            return await verifyProcess(uhg, interaction, nickname, interaction.user, false);
        }

        return interaction.reply({ content: 'Použij `/verify [nickname]`', flags: [MessageFlags.Ephemeral] });
    },

    modalOpen: async (uhg, interaction) => {
        const modal = new ModalBuilder().setCustomId('verify_modalSubmit').setTitle('Verifikace účtu');
        const input = new TextInputBuilder().setCustomId('nickname').setLabel("Tvůj Minecraft Nickname").setStyle(TextInputStyle.Short).setRequired(true).setMinLength(3).setMaxLength(16);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    },

    modalSubmit: async (uhg, interaction) => {
        await interaction.deferUpdate();
        const uuid = interaction.customId.split('_')[2];
        const discordId = interaction.fields.getTextInputValue('discordId');

        const mojang = await uhg.api.getMojang(uuid);
        if (mojang.success) {
            // Update verify v DB
            await uhg.db.updateVerify(discordId, { uuid: mojang.uuid, username: mojang.username });
            
            // OKAMŽITÝ UPDATE ROLÍ
            const member = interaction.guild.members.cache.get(discordId);
            if (member) {
                const userData = await uhg.db.getUser(mojang.uuid);
                const activeMembers = await uhg.db.getOnlineMembers("UltimateHypixelGuild");
                await uhg.roles.updateMember(member, userData, activeMembers);
            }
        }

        return module.exports.render(uhg, interaction, uuid);
    }
};

async function verifyProcess(uhg, interaction, nickname, discordUser, bypass) {
    const api = await uhg.api.call(nickname, ["hypixel"]);
    if (!api.success) return interaction.editReply(`❌ Hráč **${nickname}** nenalezen.`);

    if (!bypass) {
        const linked = api.hypixel.stats.general.links?.DISCORD;
        if (linked?.toLowerCase() !== discordUser.username.toLowerCase()) {
            return interaction.editReply(`❌ Neshoda! Na Hypixelu máš: \`${linked || "NIC"}\`.`);
        }
    }

    await uhg.db.updateVerify(discordUser.id, { uuid: api.uuid, username: api.username });
    
    // Update rolí
    const userData = await uhg.db.getUser(api.uuid);
    const activeMembers = await uhg.db.getOnlineMembers();
    const member = interaction.guild.members.cache.get(discordUser.id);
    if (member) await uhg.roles.updateMember(member, userData, activeMembers);

    await interaction.editReply(`✅ Úspěšně propojeno s **${api.username}**.`);
}
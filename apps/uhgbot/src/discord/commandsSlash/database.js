/**
 * src/discord/commandsSlash/database.js
 * Kompletní správa uživatele v nové sjednocené kolekci 'users'.
 */
const { 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle 
} = require('discord.js');

module.exports = {
    name: "database",
    description: "Správa hráče v databázi (Stats, Verifikace, Role)",
    permissions: [
        { type: 'USER', id: '378928808989949964' }, // Ty (David)
        { type: 'USER', id: '312861502073995265' }  // Farmans
    ],
    options: [
        {
            name: "player",
            description: "Jméno hráče nebo UUID",
            type: 3, // STRING
            required: true
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const playerArg = interaction.options.getString('player');
        await module.exports.render(uhg, interaction, playerArg);
    },

    /**
     * RENDER: Vygeneruje embed a tlačítka podle aktuálního stavu v DB
     */
    render: async (uhg, interaction, input) => {
        // 1. Získání identity z Mojangu
        const mojang = await uhg.api.getMojang(input);
        if (!mojang.success) {
            const msg = `❌ Hráče **${input}** se nepodařilo najít v Mojang API.`;
            return interaction.editReply ? interaction.editReply(msg) : interaction.update({ content: msg, embeds: [], components: [] });
        }

        const { username, uuid } = mojang;

        // 2. Načtení dat z naší sjednocené kolekce 'users'
        const user = await uhg.db.getUser(uuid);

        const isVerified = !!user?.discordId;
        const hasStats = !!user?.stats;
        const hasSb = !!user?.sb;

        // 3. Sestavení Embedu
        const embed = new uhg.dc.Embed()
            .setTitle(`Správa uživatele: ${uhg.dontFormat(username)}`)
            .setThumbnail(uhg.getAvatar(uuid))
            .setColor(isVerified ? "Green" : (user ? "Yellow" : "Red"))
            .addFields(
                { name: "UUID", value: `\`${uuid}\``, inline: false },
                { name: "Discord Verifikace", value: isVerified ? `✅ <@${user.discordId}>\nID: \`${user.discordId}\`` : "🟥 Nepropojeno", inline: true },
                { name: "Sledování Statistik", value: hasStats ? `✅ Aktivní\nAktualizováno: <t:${Math.round(user.stats.updated / 1000)}:R>` : "🟥 Neaktivní", inline: true }
            );

        if (hasSb) {
            embed.addFields({ name: "SkyBlock Data", value: `✅ V databázi\nProfil: \`${user.sb.profile_name || "???"}\``, inline: true });
        }

        // 4. Tlačítka - Řada 1: Statistiky
        const row1 = new ActionRowBuilder();
        if (hasStats) {
            row1.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_update_${uuid}`).setLabel('Update Stats').setStyle(ButtonStyle.Primary).setEmoji('🔄'),
                new ButtonBuilder().setCustomId(`database_btn_removeStats_${uuid}`).setLabel('Smazat Stats').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
            );
        } else {
            row1.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_addStats_${uuid}`).setLabel('Aktivovat Sledování').setStyle(ButtonStyle.Success).setEmoji('➕')
            );
        }

        // Tlačítka - Řada 2: Verifikace a Role
        const row2 = new ActionRowBuilder();
        if (isVerified) {
            row2.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_roles_${user.discordId}`).setLabel('Refresh Rolí').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                new ButtonBuilder().setCustomId(`database_btn_unverify_${user.discordId}`).setLabel('Zrušit Verify').setStyle(ButtonStyle.Secondary).setEmoji('🔗')
            );
        } else {
            row2.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_verify_${uuid}`).setLabel('Manual Verify').setStyle(ButtonStyle.Primary).setEmoji('🔑')
            );
        }

        const payload = { content: null, embeds: [embed], components: [row1, row2] };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload);
        else await interaction.update(payload);
    },

    /**
     * HANDLER TLAČÍTEK
     */
    btn: async (uhg, interaction) => {
        const action = interaction.customId.split('_')[2];
        const id = interaction.customId.split('_')[3]; // UUID nebo DiscordID

        if (action === 'update' || action === 'addStats') {
            await interaction.deferUpdate();
            
            if (action === 'addStats') {
                await uhg.db.updateOne("users", { _id: id }, { stats: { updated: 0 } });
                uhg.db.cache.users.del(id);
                await uhg.delay(500);
            }

            // 3. Voláme API se zapnutým čekáním na save (waitSave = true)
            await uhg.api.call(id, ["hypixel"], true); 
            
            return module.exports.render(uhg, interaction, id);
        }

        if (action === 'removeStats') {
            await interaction.deferUpdate();
            // $unset odstraní pole stats a sb
            await uhg.db.db.collection("users").updateOne({ _id: id }, { $unset: { stats: "", sb: "" } });
            // Smažeme z cache, aby render viděl změnu
            uhg.db.cache.users.del(id);
            return module.exports.render(uhg, interaction, id);
        }

        if (action === 'roles') {
            await interaction.deferUpdate();
            const user = await uhg.db.getUser(id); // id je zde discordId
            await uhg.roles.updateMember(id, user); 
            return interaction.followUp({ content: "✅ Role byly aktualizovány.", ephemeral: true });
        }

        if (action === 'unverify') {
            await interaction.deferUpdate();
            const deleted = await uhg.db.deleteVerify(id);
            if (deleted) await uhg.roles.updateMember(id, null); // Reset rolí
            return module.exports.render(uhg, interaction, deleted._id);
        }

        if (action === 'verify') {
            return module.exports.verifyModal(uhg, interaction, id);
        }
    },

    /**
     * MODAL PRO RUČNÍ VERIFIKACI
     */
    verifyModal: async (uhg, interaction, uuid) => {
        const modal = new ModalBuilder()
            .setCustomId(`database_modalSubmit_${uuid}`)
            .setTitle('Manuální propojení účtu');

        const input = new TextInputBuilder()
            .setCustomId('discordId')
            .setLabel("Discord ID uživatele")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("Např. 378928808989949964");

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    },

    modalSubmit: async (uhg, interaction) => {
        await interaction.deferUpdate();
        const uuid = interaction.customId.split('_')[2];
        const discordId = interaction.fields.getTextInputValue('discordId');

        const mojang = await uhg.api.getMojang(uuid);
        if (mojang.success) {
            // Zde byla chyba - voláme uhg.db.updateVerify
            await uhg.db.updateVerify(discordId, { uuid: mojang.uuid, username: mojang.username });
            
            // Refresh rolí
            const newUser = await uhg.db.getUser(mojang.uuid);
            await uhg.roles.updateMember(interaction.guild.members.cache.get(discordId), newUser);
        }

        return module.exports.render(uhg, interaction, uuid);
    }
};
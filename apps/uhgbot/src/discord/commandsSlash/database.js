/**
 * src/discord/commandsSlash/database.js
 * Pokročilá správa databáze s GUI tlačítky.
 */
const { 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle 
} = require('discord.js');

module.exports = {
    name: "database",
    description: "Správa hráčů v databázi (Status, Přidat, Odebrat, Update)",
    permissions: [
        { type: 'USER', id: '378928808989949964' }, 
        { type: 'USER', id: '312861502073995265' }
    ],
    options: [
        {
            name: "player",
            description: "Jméno hráče",
            type: 3, // STRING
            required: true
        }
    ],

    // --- 1. SPUŠTĚNÍ PŘÍKAZU ---
    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const playerArg = interaction.options.getString('player');
        await module.exports.render(uhg, interaction, playerArg);
    },

    // --- 2. RENDER GUI ---
    render: async (uhg, interaction, usernameOrUuid) => {
        const api = await uhg.api.getMojang(usernameOrUuid);
        if (!api.success) {
            const msg = `❌ Hráče **${usernameOrUuid}** se nepodařilo najít (Mojang API).`;
            return interaction.editReply ? interaction.editReply(msg) : interaction.update({ content: msg, embeds: [], components: [] });
        }

        const { username, uuid } = api;

        // 1. Verifikace (z cache nebo DB)
        const verifyData = await uhg.db.getVerify(uuid);

        // 2. Stats (S PROJEKCÍ)
        // Stáhneme jen pole, která potřebujeme pro zobrazení
        const statsData = await uhg.db.mongo.db("stats").collection("stats").findOne(
            { uuid: uuid },
            { projection: { _id: 1, updated: 1, level: 1 } }
        );

        const isVerified = !!verifyData;
        const isTracked = !!statsData;

        // 3. Sestavení Embedu
        const embed = new uhg.dc.Embed()
            .setTitle(`Databáze: ${uhg.dontFormat(username)}`)
            .setThumbnail(uhg.getAvatar(uuid))
            .setColor(isTracked ? "Green" : (isVerified ? "Yellow" : "Red"));

        let verifyText = "🟥 **NE**";
        if (isVerified) {
            verifyText = `✅ **ANO**\nDiscord: <@${verifyData._id}>\nID: \`${verifyData._id}\``;
        }
        embed.addFields({ name: "Discord Verifikace", value: verifyText, inline: true });

        let statsText = "🟥 **NE**";
        if (isTracked) {
            const updated = statsData.updated || 0;
            // Díky projekci máme jen level a updated, což nám stačí
            statsText = `✅ **ANO** (Sledován)\nAktualizováno: <t:${Math.round(updated / 1000)}:R>`;
            if (statsData.level) statsText += `\nLevel: ${uhg.f(statsData.level)}`;
        }
        embed.addFields({ name: "CZ/SK Stats DB", value: statsText, inline: true });

        embed.addFields({ name: "UUID", value: `\`${uuid}\``, inline: false });
        embed.setFooter({ text: "Použij tlačítka pro akci" });

        // 4. Tlačítka
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();

        if (isTracked) {
            row1.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_update_${uuid}`).setLabel('Aktualizovat Stats').setStyle(ButtonStyle.Primary).setEmoji('🔄'),
                new ButtonBuilder().setCustomId(`database_btn_remove_${uuid}`).setLabel('Odebrat z DB').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
            );
        } else {
            row1.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_add_${uuid}`).setLabel('Přidat do DB').setStyle(ButtonStyle.Success).setEmoji('➕')
            );
        }

        if (isVerified) {
            row2.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_roles_${verifyData._id}`).setLabel('Aktualizovat Role').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
                new ButtonBuilder().setCustomId(`database_btn_unverify_${verifyData._id}`).setLabel('Unverify').setStyle(ButtonStyle.Secondary).setEmoji('🔗')
            );
        } else {
            row2.addComponents(
                new ButtonBuilder().setCustomId(`database_btn_verify_${uuid}`).setLabel('Manual Verify').setStyle(ButtonStyle.Secondary).setEmoji('➕')
            );
        }

        const payload = { content: null, embeds: [embed], components: [row1, row2] };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload);
        else await interaction.update(payload);
    },

    // --- 3. AKCE TLAČÍTEK ---

    // Handler pro všechna tlačítka (rozcestník)
    btn: async (uhg, interaction) => {
        const action = interaction.customId.split('_')[2];
        const id = interaction.customId.split('_')[3]; // UUID nebo Discord ID

        if (action === 'add') await module.exports.addAction(uhg, interaction, id);
        else if (action === 'remove') await module.exports.removeAction(uhg, interaction, id);
        else if (action === 'update') await module.exports.updateAction(uhg, interaction, id);
        else if (action === 'roles') await module.exports.rolesAction(uhg, interaction, id);
        else if (action === 'unverify') await module.exports.unverifyAction(uhg, interaction, id);
        else if (action === 'verify') await module.exports.verifyModal(uhg, interaction, id);
    },

    // A. PŘIDAT DO STATS
    addAction: async (uhg, interaction, uuid) => {
        await interaction.deferUpdate();
        // Stáhneme data
        const api = await uhg.api.call(uuid, ["hypixel"]);
        if (api.success && api.hypixel) {
            await uhg.db.saveStats(uuid, api.hypixel);
        }
        // Znovu vykreslíme GUI
        await module.exports.render(uhg, interaction, uuid);
    },

    // B. ODEBRAT ZE STATS
    removeAction: async (uhg, interaction, uuid) => {
        await interaction.deferUpdate();
        await uhg.db.run.delete("stats", "stats", { uuid: uuid });
        uhg.db.cache.stats.del(uuid); // Smazat z cache
        await module.exports.render(uhg, interaction, uuid);
    },

    // C. AKTUALIZOVAT STATS
    updateAction: async (uhg, interaction, uuid) => {
        await interaction.deferUpdate();
        // Volání API automaticky aktualizuje DB díky logice v Api.js (pokud tam hráč je)
        // Ale pro jistotu zavoláme save explicitně, kdyby něco
        const api = await uhg.api.call(uuid, ["hypixel"]);
        if (api.success && api.hypixel) {
            await uhg.db.saveStats(uuid, api.hypixel);
        }
        await module.exports.render(uhg, interaction, uuid);
    },

    // D. AKTUALIZOVAT ROLE
    rolesAction: async (uhg, interaction, discordId) => {
        await interaction.deferUpdate();
        try {
            await uhg.roles.updateMember(discordId);
            await interaction.followUp({ content: `✅ Role pro <@${discordId}> byly aktualizovány.`, ephemeral: true });
        } catch (e) {
            await interaction.followUp({ content: `❌ Chyba při aktualizaci rolí: ${e.message}`, ephemeral: true });
        }
        // Refresh GUI není nutný, ale můžeme obnovit pro jistotu
        const user = await uhg.db.getVerify(discordId);
        if (user) await module.exports.render(uhg, interaction, user.uuid);
    },

    // E. UNVERIFY
    unverifyAction: async (uhg, interaction, discordId) => {
        await interaction.deferUpdate();
        
        // Získáme UUID pro refresh GUI před smazáním
        const user = await uhg.db.getVerify(discordId);
        const uuid = user ? user.uuid : null;

        if (!user) {
            return interaction.followUp({ content: "Uživatel již není verifikovaný.", ephemeral: true });
        }

        // 1. SMAZÁNÍ (Nová metoda)
        await uhg.db.deleteVerify(discordId);
        
        // 2. UPDATE ROLÍ (Reset)
        try {
            await uhg.roles.updateMember(discordId);
        } catch (e) {}
        
        // 3. REFRESH GUI
        if (uuid) {
            await module.exports.render(uhg, interaction, uuid);
        } else {
            interaction.editReply({ content: "Uživatel byl unverifikován.", embeds: [], components: [] });
        }
    },

    // F. MANUAL VERIFY (Modal)
    verifyModal: async (uhg, interaction, uuid) => {
        const modal = new ModalBuilder()
            .setCustomId(`database_modalVerifySubmit_${uuid}`)
            .setTitle('Manuální Verifikace');

        const input = new TextInputBuilder()
            .setCustomId('discordId')
            .setLabel("Discord ID uživatele")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Např. 378928808989949964")
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },

    // Zpracování Modalu
    modalVerifySubmit: async (uhg, interaction) => {
        await interaction.deferUpdate();
        const uuid = interaction.customId.split('_')[2];
        const discordId = interaction.fields.getTextInputValue('discordId');

        // Získáme info o hráči
        const api = await uhg.api.call(uuid, ["mojang"]);
        
        if (api.success) {
            const verifyData = {
                _id: discordId,
                uuid: api.uuid,
                nickname: api.username,
                names: api.names || [],
                date: new Date(),
                verifiedAt: Date.now()
            };
            
            await uhg.db.updateVerify(discordId, verifyData);
            
            // Zkusíme nahodit role
            try { await uhg.roles.updateMember(discordId); } catch (e) {}

            await module.exports.render(uhg, interaction, uuid);
        } else {
            await interaction.followUp({ content: "Chyba při získávání dat hráče.", ephemeral: true });
        }
    }
};
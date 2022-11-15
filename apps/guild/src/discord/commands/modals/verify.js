
const { ModalBuilder, escapeMarkdown, ActionRowBuilder, ButtonBuilder } = require('discord.js')

let reject = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('verlang_reject').setLabel('Nepřidán do databáze').setStyle(4).setDisabled(true))
let accept = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('verlang_accept').setLabel('Přidán do databáze').setStyle(3).setDisabled(true))

module.exports = {
    name: 'verify',
    description: 'Verify modal!',
    type: 'modal',
    platform: 'discord',
    run: async (uhg, interaction) => {
        if (!uhg.redis) throw 'Database is not connected!'
        let auth = ["312861502073995265", "427198829935460353", "378928808989949964", "379640544143343618"]

        let components = [
            {
                components: [
                    {
                        custom_id: 'verfiy_username',
                        label: 'Username:',
                        max_length: null,
                        min_length: null,
                        placeholder: null,
                        required: true,
                        style: 1,
                        type: 4,
                        value: null
                        }
                ],
                type: 1
            },
            {
                components: [
                    {
                        custom_id: 'verfiy_language',
                        label: 'Your language: (cz/sk/en)',
                        max_length: 2,
                        min_length: 2,
                        placeholder: null,
                        required: true,
                        style: 1,
                        type: 4,
                        value: null
                        }
                ],
                type: 1
            } 
        ]

        if (auth.includes(interaction.user.id)) components.push({components: [{ custom_id: 'verfiy_custom', label: 'Custom Verify:', max_length: 19, min_length: 17, placeholder: null, required: false, style: 1, type: 4, value: null }], type: 1 })
        const modal = new ModalBuilder().setCustomId('modal_recieve_verify').setTitle('UHG Verifikace');
        modal.addComponents(components)
    
        await interaction.showModal(modal);
    },
    recieve: async (uhg, interaction) => {
        if (!uhg.redis) interaction.reply({ content: 'Database is not connected!', ephemeral: true})
        let username = interaction.fields.getTextInputValue('verfiy_username')
        let language = interaction.fields.getTextInputValue('verfiy_language')
        let custom = interaction.fields?.getTextInputValue('verfiy_custom') || null
        
        if (!language?.match(/cz|sk|en/i)) {return interaction.reply({ content: 'Invalid language! CZ/SK/EN', ephemeral: true })}
    
        let user = interaction.user;
    
        if (custom) {
            if (!Number(custom) && custom.length < 17) {return interaction.reply({ content: 'Invalid style of requesting custom verify! (discord id)', ephemeral: true })}
            user = uhg.dc.client.users.cache.get(custom)
            if (!user) {return interaction.reply({ content: 'Invalid ID! Make sure player is on server with bot', ephemeral: true })}
        }
    
        await interaction.reply({ content: 'Starting verification!', ephemeral: true });
    
        let api = await uhg.api.call(username, ["hypixel", "guild"])
        if (!api.success) return interaction.editReply({ content: api.reason })
        let uuid = api.uuid
        username = api.username
        if (!custom && api.hypixel.links.DISCORD !== `${user.username}#${user.discriminator}`) {return interaction.editReply({ content: "Link your Discord with Hypixel" })}

        in_db = true
        let request = await uhg.redis_get(uuid, '.').then(n => n.data)
        if (!request.length || request[0] == null) {await uhg.redis_post(uuid, {}, '.'); in_db = false}

        await uhg.redis_post(uuid, uuid, '.uuid')
        await uhg.redis_post(uuid, api.textures, '.skin')
        await uhg.redis_post(uuid, api.names, '.names')
        await uhg.redis_post(uuid, api.username, '.username')
        await uhg.redis_post(uuid, user.id, '.id')
        
        interaction.editReply({ content: 'Verified as ' + api.username })

        if (!in_db && !guilds?.uhg?.members.cache.get(user.id)?.roles.cache.find(r => r.id == "985095284893814814")) {
            let buttons = new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                    .setCustomId(`modal_db_verify_${api.hypixel.username}-${api.uuid}-accept-${user.id}`)
                    .setStyle(3)
                    .setLabel("Přidat do databáze")
                )
                .addComponents(new ButtonBuilder()
                    .setCustomId(`modal_db_verify_${api.hypixel.username}-${api.uuid}-reject-${user.id}`)
                    .setStyle(4)
                    .setLabel("Nepřidávat do databáze")
                );

            dc_client.channels.cache.get('530496801782890527')?.send({ embeds: [{ title: `**${escapeMarkdown(api.hypixel.username)}**`, description: `Jazyk: **${language.toUpperCase()}**`, color: 5592575 }], components: [buttons] })
        }
    
      global?.logging_channel.send({ content: `${custom?'Custom ':''}Verify: ${user || username} - ${language} (temp msg)`, allowedMentions: { parse: [] } })
       
    },
    db: async (uhg, interaction) => {
        interaction.update({ type: 6})
        if (!uhg.redis) return interaction.message.reply({ content: 'Není zaplá DB' })
        let customId = interaction.customId.split('_')[3].split('-')
        let uuid = customId[1]
      
        if (customId[2] == "accept") {

            let api = await uhg.api.call(uuid, ["hypixel"])
            if (!api.success) interaction.message.reply({ content: api.reason })

            await uhg.redis_post(uuid, api.textures, '.skin')
            await uhg.redis_post(uuid, api.names, '.names')
            await uhg.redis_post(uuid, api.username, '.username')

            let hypixel = api.hypixel;
            ['_id'].forEach(e => delete hypixel[e]);
            await uhg.redis_post(uuid, hypixel, '.stats')
            await interaction.message.edit({ components: [accept] })
            await interaction.message.channel.send({ embeds: [{ title: `${customId[0]} byl přidán do databáze`, color: 2067276 }] })
            return
        }
        else if (customId[2] == "reject") {
            await interaction.update({ type:6 })
            await guilds.uhg?.members.cache.get(customId[3])?.roles.add(guilds.uhg?.roles.cache.find(role => role.id == "985095284893814814"))
            await interaction.message.channel.send({ embeds: [{ title: `${customId[0]} nebyl přidán do databáze`, color: 15548997 }] })
            await interaction.message.edit({ components: [reject] })
            return
        }
    }
}
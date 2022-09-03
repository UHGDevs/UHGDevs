const { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction, Modal, TextInputComponent, showModal, MessageSelectMenu } = require("discord.js");

exports.send = async (uhg, interaction) => {
    let auth = ["312861502073995265", "427198829935460353", "378928808989949964", "379640544143343618"]
    const usernameInput = new MessageActionRow().addComponents(new TextInputComponent().setCustomId('modal_test_username').setLabel("Username:").setStyle('SHORT'));
    const languageInput = new MessageActionRow().addComponents(new MessageSelectMenu().setCustomId('modal_test_language').setPlaceholder('Select language').addOptions([
            { label: 'CZECH', /* description: '',*/ value: 'czech' },
            { label: 'SLOVAK', /* description: '', */ value: 'slovak' },
            { label: 'ENGLISH', description: 'Or any other language', value: 'english' } ])
    );
   
    let components = [
        {
            components: [
                {
                    custom_id: 'modal_verfiy_username',
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
                    custom_id: 'modal_verfiy_language',
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
    if (auth.includes(interaction.user.id)) components.push({components: [{ custom_id: 'modal_verfiy_custom', label: 'Custom Verify:', max_length: 19, min_length: 17, placeholder: null, required: false, style: 1, type: 4, value: null }], type: 1 })
    const modal = new Modal().setCustomId('get_modal_verify').setTitle('UHG Verifikace');
    modal.addComponents(components)

    await interaction.showModal(modal);
}

exports.get = async (uhg, interaction) => {
    let username = interaction.fields.getTextInputValue('modal_verfiy_username')
    let language = interaction.fields.getTextInputValue('modal_verfiy_language') || ''//.toLowerCase()
    let custom;
    try {custom = interaction.fields.getTextInputValue('modal_verfiy_custom')} catch (e) {} 
    // console.log(username)
    // console.log(language)
    // console.log(custom)
    if (!language.match(/cz|sk|en/i)) {return interaction.reply({ content: 'Invalid language! CZ/SK/EN', ephemeral: true })}
    
    let gUhg = uhg.dc.client.guilds.cache.get('455751845319802880')
    let gBw = uhg.dc.client.guilds.cache.get('874337528621191251')

    let user = interaction.user;

    if (custom) {
        if (!Number(custom) && custom.length < 17) {return interaction.reply({ content: 'Invalid style of requesting custom verify! (discord id)', ephemeral: true })}
        user = uhg.dc.client.users.cache.get(custom)
        if (!user) {return interaction.reply({ content: 'Invalid ID! Make sure player is on server with bot', ephemeral: true })}
    }

    await interaction.reply({ content: 'Starting verification!', ephemeral: true });

    //let api = await uhg.getApi(username, ["key", "hypixel", "mojang", "guild"])
    let api = await uhg.api.call(username, ["hypixel", "guild"])
    if (!api.success) return interaction.editReply({ content: api })
    username = api.username
    if (!custom && api.hypixel.links.DISCORD !== `${user.username}#${user.discriminator}`) {return interaction.editReply({ content: "Link your Discord with Hypixel" })}
    
    const bannedUUIDs = ["d92fde8bd3c243298bc0a7648c38bd48", "32f4ee49fc374cd6995183fb9853f281"]
    if (bannedUUIDs.includes(api.hypixel.uuid)) return interaction.editReply({ content: `Nepodařilo se tě verifikovat!\nJméno \`${username}\` se nachází na seznamu zabanovaných UUIDs, pokud si myslíš, že se jedná o chybu, napiš členům Admin Teamu` })

    let refresh = require('../../../utils/serverroles.js')
    let uhgMember = gUhg.members.cache.get(user.id)
    if (uhgMember) { // UHG Discord server
        refresh.uhg_refresh(uhg, uhgMember, api.hypixel, api.guild)
    }

    let bwMember = gBw.members.cache.get(user.id)
    if (bwMember) { // BW Discord server
        refresh.bw_refresh(uhg, bwMember, api.hypixel)
    }

    let verified = await uhg.mongo.run.get("general", "verify")
    uhg.data.verify = verified
    verified = verified.filter(n => n._id == user.id)
    if (verified.length && verified[0].nickname == username) {return interaction.editReply({ content: `Už ${custom ? 'je':'jsi'} verifikovaný` })}

    // Overwrite Verify
    let filtered = uhg.data.verify.filter(n => n.uuid == api.uuid)
    let guild = await uhg.mongo.run.get("general", "uhg")
    let guildfiltered = guild.filter(n => n.uuid == api.uuid)
    if (filtered.length) await uhg.mongo.run.delete("general", "verify", {_id:filtered[0]._id})
    if (guildfiltered.length) {
        await uhg.mongo.run.delete("general", "uhg", {_id:guildfiltered[0]._id})
        let rank;
        rank = api.guild.all.members.filter(n => n.uuid == api.uuid)[0].rank
        await uhg.mongo.run.post("general", "uhg", {_id: user.id, username: username, uuid: api.uuid, guildrank: rank})
    }

    let post = await uhg.mongo.run.post("general", "verify", { _id: user.id, uuid: api.uuid, nickname: username, names: api.names, textures: api.textures, date: api.date })
    if (!post.acknowledged) {return interaction.editReply({ content: 'Nastala chyba v nahrávání informací do databáze!' })}
    if (!custom && !verified.length && post.insertedId==user.id) await interaction.editReply({ content: `Úspěšná verifikace jako \`${username}\`!` });
    else if (custom) await interaction.editReply({ content: `Úspěšně jsi verifikoval ${user} na \`${username}\`!` });
    else await interaction.editReply({ content: `Změnil sis jméno z \`${verified[0].nickname}\` na \`${username}\`!` });

    if (!uhg.data.stats.filter(n => n.uuid == api.uuid).length && !interaction.member.roles.cache.some(r => r.id == "985095284893814814")) {
    let buttons = new MessageActionRow()
        .addComponents(new MessageButton()
            .setCustomId(`VERLANG-${api.hypixel.username}-${api.uuid}-accept`)
            .setStyle("SUCCESS")
            .setLabel("Přidat do databáze")
        )
        .addComponents(new MessageButton()
            .setCustomId(`VERLANG-${api.hypixel.username}-${api.uuid}-reject`)
            .setStyle("DANGER")
            .setLabel("Nepřidávat do databáze")
        );
    let embed = new MessageEmbed()
        .setTitle(`**${uhg.dontFormat(api.hypixel.username)}**`)
        .setDescription(`Jazyk: **${language.toUpperCase()}**`)
        .setColor(5592575);
    let channel = await uhg.dc.client.channels.cache.get('530496801782890527')
    channel.send({ embeds: [embed], components: [buttons] })
   }

   uhg.dc.client.channels.cache.get('548772550386253824').send({ content: `${custom?'Custom ':''}Verify: ${user || username} - ${language} (temp msg)`, allowedMentions: { parse: [] } })
   

}
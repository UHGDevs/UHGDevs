const { MessageEmbed, MessageButton, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent } = require("discord.js");

module.exports = async (uhg, interaction) => {
    let customId = interaction.customId.split("_")

    if (customId[1] !== "customtext") await interaction.update({ type:6 })

    let mention = [];

    let buttonsMain = new MessageActionRow()
        .addComponents(new MessageButton()
            .setCustomId(`FORUMS_true`)
            .setStyle("SUCCESS")
            .setLabel("Dát do Oznámení")
        )
        .addComponents(new MessageButton()
            .setCustomId(`FORUMS_false`)
            .setStyle("DANGER")
            .setLabel("Nedávat do Oznámení")
        );

    let falseRes = new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId(`FORUMS_backDisabled`).setLabel('Článek neposlán').setStyle('DANGER').setDisabled(true),
                new MessageButton().setCustomId(`FORUMS_back`).setLabel('Jít zpět?').setStyle('SECONDARY')
            )

    let trueRes = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(`FORUMS_select`)
                    .setPlaceholder('Vyber roli pro označení!')
                    .setMinValues(1)
                    .setMaxValues(4)
                    .addOptions(
                    {
                        label: 'Hypixel oznámení',
                        value: 'hypixel'
                    },
                    {
                        label: 'Skyblock oznámení',
                        value: 'skyblock'
                    },
                    {
                        label: 'Discord oznámení',
                        value: 'discord'
                    },
                    {
                        label: 'Everyone',
                        value: 'everyone'
                    },
                    {
                        label: 'Neoznačovat',
                        value: 'none'
                    }
                    )
            )
    let trueRes2 = new MessageActionRow()
            .addComponents(new MessageButton().setCustomId(`FORUMS_confirm`).setLabel('Potvrdit').setStyle('SUCCESS').setDisabled(true), new MessageButton().setCustomId(`FORUMS_customtext`).setLabel('Vlastní text').setStyle('PRIMARY').setDisabled(true), new MessageButton().setCustomId(`FORUMS_back`).setLabel('Jít zpět?').setStyle('SECONDARY'))
    let trueRes3 = new MessageActionRow()
            .addComponents(new MessageButton().setCustomId(`FORUMS_confirm`).setLabel('Potvrdit').setStyle('SUCCESS'), new MessageButton().setCustomId(`FORUMS_customtext`).setLabel('Vlastní text').setStyle('PRIMARY'), new MessageButton().setCustomId(`FORUMS_back`).setLabel('Jít zpět?').setStyle('SECONDARY'))


    if (customId[1] === "true") {
        await interaction.editReply({ components: [trueRes, interaction.message?.embeds[0].fields[3] ? trueRes3 : trueRes2] })
    } else if (customId[1] === "false") {
        await interaction.editReply({ components: [falseRes] })
    } else if (customId[1] === "back") {
        await interaction.editReply({ components: [buttonsMain] })
    } else if (customId[1] === "select") {
        let values = interaction.values || []
        let embed = interaction.message?.embeds[0]
        values.forEach(n => {
            switch (n) {
                case 'hypixel':
                    mention.push("<@&1003713647845052466>")
                    break
                case 'skyblock':
                    mention.push("<@&1003713511710543952>")
                    break
                case 'discord':
                    mention.push("<@&1003713161238679652>")
                    break
                case 'everyone':
                    mention.push("@everyone")
                    break
            }
        })
        if (embed.fields.length == 3) embed.addFields( { name: 'ㅤ', value: 'ㅤ', inline: false } )
        embed.fields[3] = { name: `**Role, které budou označený v Oznámení:**`, value: `${mention.join(' ') || '*Žádná*'}`, inline: false }
        if (embed.fields.length == 4) embed.addFields( { name: 'ㅤ', value: 'ㅤ', inline: false } )
        await interaction.editReply({ embeds: [embed], components: [trueRes, trueRes3] })
    } else if (customId[1] === "confirm") {// FINAL MSG V OZNÁMENÍ
        let channel = await uhg.dc.client.channels.cache.get('468084524023021568') // OZNÁMENÍ CHANNEL
        let msg = `\n${interaction.message?.embeds[0].url}`
        if (interaction.message?.embeds[0].fields[5] && interaction.message?.embeds[0].fields[5].value !== '*Žádný*') msg = `${interaction.message?.embeds[0].fields[5].value} ${msg}`
        if (interaction.message?.embeds[0].fields[3].value !== '*Žádná*') msg = `[${interaction.message?.embeds[0].fields[3].value}] ${msg}`
        channel.send({ content: msg, allowedMentions: { parse: ["everyone", "roles"] } })
        await interaction.editReply( { components: [] } )
        await uhg.mongo.run.update("general", "forums", {link: interaction.message?.embeds[0].url}, {announced: true})
    } else if (customId[1] === "customtext") {
        let component = new MessageActionRow().addComponents(new TextInputComponent().setCustomId(`FORUMS_customtextComp`).setLabel("Vlastní text:").setStyle('PARAGRAPH').setPlaceholder("[@ping] TEXT... https://url.cz \n\n! ! ! NAPIŠ POUZE TEN TEXT, NIC JINÉHO, NE ODKAZ ANI ZMÍNKU ! ! !").setMaxLength(1500).setRequired(false));
        let modal = new Modal().setCustomId(`FORUMS_customtextModal`).setTitle(`Vlastní text do Oznámení [FORUMS]`).addComponents(component)
        await interaction.showModal(modal);
    } else if (customId[1] === "customtextModal") {
        let text = interaction.fields.getTextInputValue("FORUMS_customtextComp")
        let embed = interaction.message?.embeds[0]
        if (embed.fields.length == 5) embed.addFields( { name: 'ㅤ', value: 'ㅤ', inline: false } )
        embed.fields[5] = { name: `**Vlastní text:**`, value: text.trim() || "*Žádný*", inline: false }
        if (embed.fields.length == 6) embed.addFields( { name: 'ㅤ', value: 'ㅤ', inline: false } )
        await interaction.editReply({ embeds: [embed] })
    }
}

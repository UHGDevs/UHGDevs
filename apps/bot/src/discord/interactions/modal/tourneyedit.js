const { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction, Modal, TextInputComponent, showModal, MessageSelectMenu } = require("discord.js");

exports.send = async (uhg, interaction) => {
   
    let components = [
        {
            components: [
                {
                    custom_id: 'modal_tourney_games',
                    label: 'Games:',
                    max_length: null,
                    min_length: null,
                    placeholder: "Napiš počet max her",
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
                    custom_id: 'modal_tourney_cutename',
                    label: 'Cute Name:',
                    max_length: null,
                    min_length: null,
                    placeholder: "Napiš jméno turnaje k zobrazení",
                    required: true,
                    style: 1,
                    type: 4,
                    value: null
                    }
            ],
            type: 1
        }
    ]
    const modal = new Modal().setCustomId('get_modal_tourneyedit').setTitle('Upravit turnaj');
    modal.addComponents(components)

    await interaction.showModal(modal);
}

exports.get = async (uhg, interaction) => {
    await interaction.deferReply({ephemeral: false})
    let games = interaction.fields.getTextInputValue('modal_tourney_games')
    let cutename = interaction.fields.getTextInputValue('modal_tourney_cutename')

    let tourney = interaction.message?.embeds[0].title
    
    let acknowledged = await uhg.mongo.run.update("general", "tourneys", {tourney: tourney}, {cutename: cutename, games: games})
    
    if (acknowledged.acknowledged) await interaction.editReply({embeds: [new MessageEmbed().setTitle(`Turnaj ${tourney} byl pozměněn`).setFooter({text: `Executed by ${interaction.user.username}`})]})
    else await interaction.editReply({embeds: [new MessageEmbed().setTitle(`Někde nastala chyba při upravování ${tourney} turnaje`).setFooter({text: `Executed by ${interaction.user.username}`})]})
   

}
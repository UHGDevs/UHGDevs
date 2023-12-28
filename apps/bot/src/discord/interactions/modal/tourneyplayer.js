const { MessageEmbed, MessageButton, MessageActionRow, CommandInteraction, Modal, TextInputComponent, showModal, MessageSelectMenu } = require("discord.js");

exports.send = async (uhg, interaction) => {
   
    let components = [
        {
            components: [
                {
                    custom_id: 'modal_tourney_player',
                    label: 'Username:',
                    max_length: null,
                    min_length: null,
                    placeholder: "Napiš jméno hráče, který již odehrál nový turnaj",
                    required: true,
                    style: 1,
                    type: 4,
                    value: null
                    }
            ],
            type: 1
        }
    ]
    const modal = new Modal().setCustomId('get_modal_tourneyplayer').setTitle('Přidat turnaj');
    modal.addComponents(components)

    await interaction.showModal(modal);
}

exports.get = async (uhg, interaction) => {
    await interaction.deferReply({ephemeral: true})
    let player = interaction.fields.getTextInputValue('modal_tourney_player')
    
    let api = await uhg.api.call(player)
    if (!api.success) return api.reason
    let tourneys = [];
    Object.keys(api.hypixel.tourney).forEach(e => {
        if (!["first_join_lobby", "total_tributes", "shop_sort", "hide_purchased", "selected_head_status", "playtime"].includes(e)) {
        tourneys.push(e);
        }
    });
    let currenttourney;
    for (let i = 0; i<tourneys.length; i++) {
        let db = await uhg.mongo.run.get('general', 'tourneys')
        if (!db.some(e => e.tourney == tourneys[i])) {
        await uhg.mongo.run.post("general", "tourneys", {_id:db.length, tourney: tourneys[i], games: 0, cutename: "???"})
        currenttourney = tourneys[i]
        }
    }
    if (currenttourney) {
        await uhg.mongo.run.update("general", "tourneys", {_id: 0}, {currenttourney: currenttourney})
        await interaction.followUp({ content: `Turnaj ${currenttourney} byl přidán`, ephemeral: true })
    } else {
        await interaction.followUp({ content: "Nebyl nalezen žádný nový turnaj", ephemeral: true })
    }

   

}

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
    name: eventName,
    description: "Denní guild statistiky",
    emoji: '🛞',
    time: '0 0 7 * * *', //'*/10 * * * * *'
    ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
    onstart: false,
    run: async (uhg, options) => {

        let embed = await uhg.commands.get('comparation')?.run(uhg, {refresh: true, date: previousDay()})
        let channel = dc_client.channels.cache.get("933036082541498408");
        channel?.send({ embeds: [embed.embed] })

    }
}
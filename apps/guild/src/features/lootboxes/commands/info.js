const { Collection } = require("discord.js")


class Info {
    constructor(loot) {
        this.loot = loot

        this.info = new Collection()
        let info = {
                what: { name: 'Co jsou G-Boxy?', value: 'Jde prakticky o loot boxy, které jdou odemknout klíčem koupeným za GEXPy.'},
                earning: { name: 'Jak získám GEXPy?', value: `GEXPy (${this.loot.emojis.get('gexp')}) jdou získat normálním hraním na Hypixelu _(/g member [nickname])_ nebo je lze vyhrát na UHG eventech` },
                opening: { name: 'Jak můžu G-Box otevřít?', value: 'Nejdřív si musíš koupit klíč k danému boxu. Jsou 3 druhy boxů, Bronze (<:wooden_box_0:999761772061933619>) za 10,000 GEXP, Golden (<:golden_box_1:999762479452278854>) za 100,000 GEXP a Diamond (<:diamond_box_1:999762477367689248>) za 1,000,000 GEXP. Prakticky platíš za klíč (<:wooden_key:999762931623407637>,<:golden_key:999761802214789200>,<:diamond_key:999762928884535377>) nikoliv za G-Box. Po koupi klíče zjistíš, jaká rarita klíče ti padla (Common<:wooden_key_common:999762976787673128>, Rare<:wooden_key_rare:999762983892815942>, Epic<:wooden_key_epic:999762979354595480>, Legendary<:wooden_key_legendary:999762981640486962>) a od toho se bude odvíjet i tvůj loot v G-Boxu.'},
                commands: { name: 'Jsou nějaké příkazy?', value: 'ne' },
                drop: { name: 'Co když drop nechci/nemohu uplatnít?', value: 'Všechny dropy lze prodat, buď rovnou v GUI otevřeného G-Boxu pomocí tlačítka "Prodat", nebo pomocí přes inventář, kde lze konkrétní itemy spravovat.'},
                questions: { name: 'Další otázky?', value: 'Obrať se na <@379640544143343618> nebo <@378928808989949964>'}
            }
        for (let a in info) {
            this.info.set(a, info[a])
        }

       // this.get()
    }

    get() {
        let embeds = this.loot.embeds.info.embeds
        let components = this.loot.embeds.info.components
        let embed = { title: 'Informace k G-boxům', fields: this.info.map(n => n), footer: { text: 'UHGDevs', icon: 'https://media.discordapp.net/attachments/408250362978369546/1020767411131129856/UHG_kraj.png'}, color: 3092790 }


        let component = { type: 1, components: [
            {
                type: 2,
                label: 'G-Boxy',
                customId: 'loot_open-gui_box',
                style: 1,
                emoji_null: { animated: false, name: '🎁', id: null },
                url: null,
                disabled: false
              },
              {
                type: 2,
                label: 'Inventory',
                customId: 'loot_open-gui_inventory',
                style: 1,
                emoji_null: { animated: false, name: '🧺', id: null },
                url: null,
                disabled: false
              }
        ]}

       // dc_client.channels.cache.get('875503798733385779').send( {embeds: [embed], components: [component]})

        return { message: 'UHG odměnový systém', embeds: [embed], components: [component], minecraft: 'Odměnový systém pro UHG' }
    }
}

module.exports = {
    name: 'info',
    class: Info
}
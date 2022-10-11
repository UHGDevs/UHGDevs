

class Boxes {
    constructor(loot) {
        this.loot = loot
    }

    get(options) {
        let info = this.loot.data.boxes[options.box?.toLowerCase() || 'bronze']

        let embeds = [ { title: info.name, description: `Cena: ${f(info.price)} ${this.loot.data.emoji.coin} GEXP`, image: { url: info.image }} ]
        let components; // = 

        return { message: `Cena ${info.name}u je ${f(info.price)} ${this.loot.data.emoji.coin} GEXP`, embeds: embeds, components: null, minecraft: `Cena ${info.name}u je ${f(info.price)} GEXP`, data: info }
    }
}


module.exports = {
    name: 'boxes',
    class: Boxes
}
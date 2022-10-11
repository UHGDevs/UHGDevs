
const path = require('node:path');
const fs = require('fs');
const { Collection } = require('discord.js');

class LootBoxes {
    constructor() {
        this.embeds = JSON.parse(fs.readFileSync(path.join(__dirname, './embeds.json'), 'utf8'));
        //fs.watchFile(path.resolve(__dirname, './embeds.json'), () => this.refreshEmbeds());

        this.loot_tables = JSON.parse(fs.readFileSync(path.join(__dirname, './data/loot_tables.json'), 'utf8'));
        this.data = JSON.parse(fs.readFileSync(path.join(__dirname, './data/data.json'), 'utf8'));

        this.emojis = new Collection()
        for (let emoji in this.data.emoji) {
            emoji = this.data.emoji[emoji]
            this.emojis.set(emoji.name, emoji.raw)
        }

        this.commands = new Collection()
        fs.readdirSync(path.join(__dirname, './commands')).filter((file) => file.endsWith(".js")).forEach(n => { let h = require(`./commands/${n}`); this.commands.set(h.name, new h.class(this))})

        //let cmd = this.commands.get('boxes').get({ box: 'bronze' })
        //console.log(cmd)
    }
}

module.exports = {class: new LootBoxes(), name: 'loot'}
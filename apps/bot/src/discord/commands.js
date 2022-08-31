const fs = require("fs");
module.exports = (uhg) => {
    try {
        const commands = fs.readdirSync(`src/discord/commands/`).filter((file) => file.endsWith(".js"));
        for (let file of commands) {
            try {
                let pull = require(`./commands/${file}`);
                if (pull.name) uhg.dc.commands.set(pull.name, pull);
                if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => uhg.dc.aliases.set(alias, pull.name));
            } catch (e) {console.log(e)}
        }
        console.log(`${uhg.dc.commands.size}/${commands.length} Discord Commands`.brightGreen);

        const slash = fs.readdirSync(`src/discord/commandsSlash/`).filter((file) => file.endsWith(".js"));
        for (let file of slash) {
            try {
                let pull = require(`./commandsSlash/${file}`);
                if (pull.name) uhg.dc.slash.set(pull.name, pull);
            } catch (e) {console.log(e)}
        }
        console.log(`${uhg.dc.slash.size}/${slash.length} Discord Slash Commands`.brightGreen);

        const loot = fs.readdirSync(`src/discord/lootBoxes/commands/`).filter((file) => file.endsWith(".js"));
        for (let file of loot) {
            try {
                let pull = require(`./lootBoxes/commands/${file}`);
                if (pull.name) uhg.dc.loot.set(pull.name, pull);
            } catch (e) {console.log(e)}
        }
        console.log(`${uhg.dc.loot.size}/${loot.length} Discord loot Commands`.brightGreen);
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}

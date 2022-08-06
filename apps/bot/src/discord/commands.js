const fs = require("fs");
module.exports = (uhg) => {
    try {
        const commands = fs.readdirSync(`discord/commands/`).filter((file) => file.endsWith(".js"));
        for (let file of commands) {
            let pull = require(`./commands/${file}`);
            if (pull.name) uhg.dc.commands.set(pull.name, pull);
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => uhg.dc.aliases.set(alias, pull.name));
        }
        console.log(`${uhg.dc.commands.size} Discord Commands`.brightGreen);

        const slash = fs.readdirSync(`discord/commandsSlash/`).filter((file) => file.endsWith(".js"));
        for (let file of slash) {
            let pull = require(`./commandsSlash/${file}`);
            if (pull.name) uhg.dc.slash.set(pull.name, pull);
        }
        console.log(`${uhg.dc.slash.size} Discord Slash Commands`.brightGreen);

        const cmd = fs.readdirSync(`discord/commandsCmd/`).filter((file) => file.endsWith(".js"));
        for (let file of cmd) {
            let pull = require(`./commandsCmd/${file}`);
            if (pull.name) uhg.dc.cmd.set(pull.name, pull);
        }
        console.log(`${uhg.dc.cmd.size} Discord cmd Commands`.brightGreen);

        const loot = fs.readdirSync(`discord/lootBoxes/commands/`).filter((file) => file.endsWith(".js"));
        for (let file of loot) {
            let pull = require(`./lootBoxes/commands/${file}`);
            if (pull.name) uhg.dc.loot.set(pull.name, pull);
        }
        console.log(`${uhg.dc.loot.size} Discord loot Commands`.brightGreen);
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}

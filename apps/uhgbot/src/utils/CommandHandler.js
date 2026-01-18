/**
 * src/utils/CommandHandler.js
 */

const fs = require('fs');
const path = require('path');
require('colors');

class CommandHandler {
    constructor(uhg) {
        this.uhg = uhg;
    }

    async loadAll() {
        console.log(' [CMDS] '.bgCyan.black + ' Startuji načítání příkazů...'.cyan);

        // 1. Slash Commands
        await this._loadFolder(
            path.resolve(__dirname, '../discord/commandsSlash'),
            this.uhg.dc.slash,
            null,
            'Slash'
        );

        // 2. Klasické Discord Commands
        await this._loadFolder(
            path.resolve(__dirname, '../discord/commands'),
            this.uhg.dc.commands,
            this.uhg.dc.aliases,
            'Message'
        );

        // 3. Minecraft Commands
        await this._loadFolder(
            path.resolve(__dirname, '../minecraft/commands'),
            this.uhg.mc.commands,
            this.uhg.mc.aliases,
            'Minecraft'
        );
    }

    async _loadFolder(dirPath, collection, aliasCollection, label) {
        if (!fs.existsSync(dirPath)) return;

        // Kontrola, zda kolekce existuje, aby to nehodilo "reading clear" error
        if (!collection) {
            console.error(` [ERROR] Kolekce pro ${label} není inicializována v Uhg.js!`.red);
            return;
        }

        collection.clear();
        if (aliasCollection) aliasCollection.clear();

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));

        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                delete require.cache[require.resolve(filePath)];
                const cmd = require(filePath);

                if (cmd.name) {
                    collection.set(cmd.name.toLowerCase(), cmd);
                    if (aliasCollection && cmd.aliases) {
                        cmd.aliases.forEach(a => aliasCollection.set(a.toLowerCase(), cmd.name.toLowerCase()));
                    }
                }
            } catch (e) {
                console.error(` [ERROR] ${label} - ${file}:`.red, e.message);
            }
        }
        console.log(` [OK] ${label}: ${collection.size} načteno.`.green);
    }

        async reload() {
        await this.loadAll(); // Znovu načte soubory ze všech 3 složek
        
        // Znovu zaregistruje Slash příkazy na Discordu
        if (this.uhg.dc.client.isReady()) {
            try {
                // OPRAVA: Název musí odpovídat tvému souboru v src/discord/events/
                const readyEvent = require('../discord/events/clientReady'); 
                await readyEvent(this.uhg, this.uhg.dc.client);
            } catch (e) {
                console.error("Chyba při znovunačtení ready eventu:", e);
            }
        }
        
        return `Načteno: ${this.uhg.dc.slash.size} Slash, ${this.uhg.dc.commands.size} Message, ${this.uhg.mc.commands.size} MC příkazů.`;
    }
}

module.exports = CommandHandler;
/**
 * src/discord/handler.js
 * Zavaděč Discord eventů.
 */

const fs = require('fs');
const path = require('path');
require('colors');

module.exports = (uhg) => {
    const eventsPath = path.resolve(__dirname, 'events');
    
    if (!fs.existsSync(eventsPath)) {
        return console.log('[Handler] Složka events nebyla nalezena.'.yellow);
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        
        // Vymažeme cache souboru pro případný reload
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        const eventName = file.split('.')[0];

        // Prevence duplicitních listenerů (důležité pro reload bez restartu)
        uhg.dc.client.removeAllListeners(eventName);

        // Nabindujeme event na klienta a předáme instanci 'uhg' jako první argument
        uhg.dc.client.on(eventName, event.bind(null, uhg));
    }

    console.log(`[Handler] ${eventFiles.length} Discord eventů zaregistrováno.`.green);
};
/**
 * ************************************************************
 * UHG Bot - Entry Point
 * ************************************************************
 * Tento soubor inicializuje prostředí, nastavuje Discord 
 * klienta a spouští hlavní třídu bota.
 */

require('dotenv').config(); // Načtení tajných klíčů z .env
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const Uhg = require('./utils/Uhg');
require('colors'); // Barevné logování do konzole

// 1. Konfigurace Discord Klienta
// Nastavujeme Intenty (oprávnění, co bot může číst) a Partials (pro příjem DM)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Základní funkce serveru
        GatewayIntentBits.GuildMembers,    // Sledování příchodů/odchodů a rolí
        GatewayIntentBits.GuildMessages,   // Čtení zpráv na serveru
        GatewayIntentBits.MessageContent,  // Nutné pro čtení obsahu zpráv (v14+)
        GatewayIntentBits.DirectMessages,  // Čtení soukromých zpráv
        GatewayIntentBits.GuildVoiceStates // Pokud bot pracuje s voice kanály
    ],
    partials: [
        Partials.Channel, // Důležité pro funkční Direct Messages
        Partials.Message, 
        Partials.GuildMember
    ],
    allowedMentions: { 
        parse: ["users", "roles"], 
        repliedUser: true // Povolí mention při odpovědi
    }
});

// 2. Inicializace hlavního mozku bota (Uhg.js)
const uhg = new Uhg(client);

// 3. Globální Error Handling (Ochrana před pádem)
// Pokud kód narazí na neošetřenou chybu, bot se pokusí nespadnout a vypíše ji do konzole.
process.on('uncaughtException', (error) => {
    console.error(' [CRITICAL] Neošetřená výjimka: '.bgRed.white, error);
});

process.on('unhandledRejection', (reason) => {
    console.error(' [CRITICAL] Neodchycený slib (Promise): '.bgRed.white, reason);
});

/**
 * Hlavní startovací funkce
 */
(async () => {
    console.log('--------------------------------------------------'.gray);
    console.log('   UHG BOT - Startovní sekvence spuštěna   '.bold.cyan);
    console.log('--------------------------------------------------'.gray);

    // Připojení k DB a načtení příkazů
    await uhg.init();

    // Přihlášení k Discordu
    client.login(process.env.token).catch(err => {
        console.error(' [ERROR] Nepodařilo se přihlásit k Discordu! '.red, err);
        process.exit(1); // Ukončí proces při selhání přihlášení
    });
})();

// Exportujeme instanci pro případné debugování
module.exports = uhg;
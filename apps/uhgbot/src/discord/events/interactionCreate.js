/**
 * src/discord/events/interactionCreate.js
 * Hlavní rozcestník pro veškeré interakce (Slash, Tlačítka, Modaly, Menu, Autocomplete).
 */

module.exports = async (uhg, interaction) => {
    
    // --- 1. SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {
        const cmd = uhg.dc.slash.get(interaction.commandName);
        if (!cmd) return;

        // Kontrola práv (používá uhg.handlePerms z Uhg.js)
        if (!uhg.handlePerms(cmd.permissions, interaction)) {
            return interaction.reply({ content: "K tomuto příkazu nemáš oprávnění.", ephemeral: true });
        }

        try {
            await cmd.run(uhg, interaction);
        } catch (e) {
            console.error(` [ERROR] Slash ${interaction.commandName}: `.bgRed, e);
            const errMsg = "Nastala chyba při vykonávání příkazu.";
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: errMsg, ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content: errMsg, ephemeral: true }).catch(() => {});
            }
        }
    } 

    // --- 2. AUTOCOMPLETE (Našeptávač) ---
    // Nutné, pokud tvé Slash příkazy nabízejí seznam hráčů/eventů za běhu
    else if (interaction.isAutocomplete()) {
        const cmd = uhg.dc.slash.get(interaction.commandName);
        if (cmd && typeof cmd.autocomplete === 'function') {
            try {
                await cmd.autocomplete(uhg, interaction);
            } catch (e) {
                console.error(` [ERROR] Autocomplete ${interaction.commandName}: `.bgRed, e);
            }
        }
    }

    // --- 3. TLAČÍTKA, MODALY A SELECTY (Smart Dispatcher) ---
    else if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        if (!customId) return;

        /**
         * Logika rozkladu ID (např. "time_toggle_database"):
         * parts[0] = "time" (jméno souboru v commandsSlash)
         * parts[1] = "toggle" (název funkce uvnitř souboru)
         */
        const parts = customId.split('_');
        const cmdName = parts[0]; 
        
        // Hledáme soubor buď v slash kolekci nebo v klasické
        const cmdFile = uhg.dc.slash.get(cmdName) || uhg.dc.commands.get(cmdName);
        
        if (cmdFile) {

            if (!uhg.handlePerms(cmdFile.permissions, interaction)) {
                return interaction.reply({ 
                    content: "Nemáš oprávnění k interakci s tímto prvkem!", 
                    ephemeral: true 
                });
            }
            
            let methodName = parts[1];
            
            // Kompatibilita pro ID typu "verify_cmd_accept" (přeskočí 'cmd' nebo 'ignore')
            if (methodName === 'cmd' || methodName === 'ignore') {
                methodName = parts[2];
            }

            // Pokud v souboru existuje funkce s tímto názvem, spustíme ji
            if (typeof cmdFile[methodName] === 'function') {
                try {
                    await cmdFile[methodName](uhg, interaction);
                } catch (e) {
                    console.error(` [ERROR] Interaction (${cmdName}.${methodName}): `.bgRed, e);
                    // Informování uživatele, že kliknutí selhalo
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: "Chyba při zpracování interakce.", ephemeral: true }).catch(() => {});
                    }
                }
            }
        }
    }
};
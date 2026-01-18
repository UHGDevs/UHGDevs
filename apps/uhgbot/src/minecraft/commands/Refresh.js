/**
 * src/minecraft/commands/Reload.js
 * Minecraft verze příkazu pro aktualizaci bota.
 */

module.exports = {
    name: "Refresh",
    aliases: ["refresh", "reload", "aktualizovat"],
    run: async (uhg, pmsg) => {
        // 1. KONTROLA OPRÁVNĚNÍ (podle Minecraft jména)
        // Seznam lidí, kteří mohou bota aktualizovat ze hry
        const admins = ["DavidCzPdy", "Farmans"]; 
        
        if (!admins.includes(pmsg.username)) {
            return "Nemáš oprávnění k restartování příkazů!";
        }

        try {
            console.log(` [MC SYSTEM] `.bgYellow.black + ` Ruční aktualizace příkazů spuštěna hráčem ${pmsg.username}`.yellow);

            // 2. SPUŠTĚNÍ RELOADU
            // Tato funkce vymaže cache a znovu načte složky commands, commandsSlash a minecraft/commands
            const result = await uhg.cmds.reload();

            // 3. ODPOVĚĎ
            // Vrátíme objekt, aby bot odpověděl v MC textem a na Discordu (pokud je bridge aktivní) poslal info
            return {
                mc: `Příkazy aktualizovány! (${uhg.dc.slash.size} Slash, ${uhg.dc.commands.size} Msg, ${uhg.mc.commands.size} MC)`,
                dc: new uhg.dc.Embed()
                    .setTitle("🔄 Reload")
                    .setDescription(`Hráč **${pmsg.username}** aktualizoval příkazy.\n\n${result}`)
                    .setColor("Yellow")
                    .setTimestamp()
            };

        } catch (e) {
            console.error(e);
            return `Chyba při aktualizaci: ${e.message}`;
        }
    }
};
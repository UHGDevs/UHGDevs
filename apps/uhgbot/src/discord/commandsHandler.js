/**
 * src/discord/commandsHandler.js
 */
module.exports = async (uhg, interactionOrMessage) => {
    const isSlash = typeof interactionOrMessage.isChatInputCommand === 'function' && interactionOrMessage.isChatInputCommand();
    const commandName = isSlash ? interactionOrMessage.commandName : interactionOrMessage.commandNameFromPrefix;
    
    // 1. Vyhledání příkazu
    let cmd = uhg.dc.slash.get(commandName) || uhg.dc.commands.get(commandName) || uhg.dc.commands.get(uhg.dc.aliases.get(commandName));

    // 2. Hledání v MC složce
    if (!cmd) {
        cmd = uhg.mc.commands.get(commandName) || uhg.mc.commands.get(uhg.mc.aliases.get(commandName));
        if (cmd) {
            const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;
            
            // Pokud je to Slash, nemáme content, vyrobíme ho uměle. Pokud Message, ořízneme prefix.
            let content = "";
            if (isSlash) {
                // Rekonstrukce argumentů pro MC příkazy ze Slash options by byla složitá, 
                // prozatím předpokládáme základní použití.
                // Většina MC příkazů bere pmsg.nickname.
                const playerOption = interactionOrMessage.options.getString('player') || interactionOrMessage.options.getString('nickname');
                content = playerOption ? `${commandName} ${playerOption}` : commandName;
            } else {
                content = interactionOrMessage.content.slice(uhg.config.prefix.length);
            }

            const pmsg = {
                username: (await uhg.db.getVerify(userId))?.nickname || interactionOrMessage.member?.nickname || interactionOrMessage.author?.username || "Unknown",
                content: content,
                channel: 'Discord',
                message: interactionOrMessage 
            };
            return require('../minecraft/commandsHandler')(uhg, pmsg);
        }
    }

    if (!cmd) return;

    // 3. Práva
    if (!uhg.handlePerms(cmd.permissions, interactionOrMessage)) {
        const msg = "Nemáš oprávnění k tomuto příkazu.";
        return isSlash ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.reply(msg);
    }

    // 4. Spuštění
    try {
        let response;
        if (isSlash) {
            await cmd.run(uhg, interactionOrMessage);
            // Slash commandy si řeší odpověď samy uvnitř run()
        } else {
            const args = interactionOrMessage.content.slice(uhg.config.prefix.length).trim().split(/ +/);
            args.shift();
            response = await cmd.run(uhg, interactionOrMessage, args.join(" "));
        }
        console.log(response)

        // --- ODESLÁNÍ DO MC ---
        // Pokud příkaz vrátil odpověď (běžné u !cmd, ne u Slash)
        if (response) {
            // A. Odpověď na Discord
            if (typeof response === 'string') interactionOrMessage.reply({ content: response, failIfNotExists: false });
            else if (response.dc) interactionOrMessage.reply({ embeds: [response.dc], failIfNotExists: false });

            // B. Odpověď do Minecraftu (Bridge)
            // Zkontrolujeme, jestli zpráva přišla z bridge kanálu
            const channelId = interactionOrMessage.channel.id;
            const mcMessage = response.mc || (typeof response === 'string' ? response : null);

            if (mcMessage) {
                if (channelId === uhg.config.channels.guild) {
                    uhg.minecraft.send(`/gc ${mcMessage}`);
                } else if (channelId === uhg.config.channels.officer) {
                    uhg.minecraft.send(`/go ${mcMessage}`);
                }
            }
        }
    } catch (e) {
        console.error(` [ERROR] Discord Command ${commandName}: `.red, e);
    }
};
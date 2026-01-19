/**
 * src/discord/commandsHandler.js
 * Vykonává logiku příkazů na Discordu.
 * - Blokuje spuštění Slash příkazů přes prefix (!).
 * - Umožňuje klasickým příkazům posílat odpověď i do Minecraftu (Bridge).
 */

module.exports = async (uhg, interactionOrMessage) => {
    // Detekce, zda jde o Slash (interakci) nebo Message
    const isSlash = typeof interactionOrMessage.isChatInputCommand === 'function' && interactionOrMessage.isChatInputCommand();
    const commandName = isSlash ? interactionOrMessage.commandName : interactionOrMessage.commandNameFromPrefix;
    
    let cmd;

    // 1. Hledání v klasických Discord příkazech (!příkaz)
    cmd = uhg.dc.commands.get(commandName) || uhg.dc.commands.get(uhg.dc.aliases.get(commandName));

    // 2. Pokud není v klasických, zkusíme Minecraft složku (sdílené příkazy jako !bw)
    if (!cmd) {
        const mcCmd = uhg.mc.commands.get(commandName) || uhg.mc.commands.get(uhg.mc.aliases.get(commandName));
        if (mcCmd) {
            const userId = isSlash ? interactionOrMessage.user.id : interactionOrMessage.author.id;
            
            let content = "";
            if (isSlash) {
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

    // 3. Pokud stále nic, podíváme se do Slash příkazů
    if (!cmd) {
        const slashCmd = uhg.dc.slash.get(commandName);
        if (slashCmd) {
            // OCHRANA: Pokud se někdo snaží spustit Slash příkaz přes text (!profile), zablokujeme to.
            if (!isSlash) {
                return interactionOrMessage.reply({ 
                    content: `⚠️ Příkaz **${commandName}** je Slash příkaz.\nPoužij prosím **/${commandName}**.`, 
                    allowedMentions: { parse: [] } 
                });
            }
            cmd = slashCmd;
        }
    }

    if (!cmd) return;

    // 4. Kontrola práv
    if (!uhg.handlePerms(cmd.permissions, interactionOrMessage)) {
        const msg = "Nemáš oprávnění k tomuto příkazu.";
        return isSlash ? interactionOrMessage.reply({ content: msg, ephemeral: true }) : interactionOrMessage.reply(msg);
    }

    // 5. Spuštění
    try {
        if (isSlash) {
            // Slash command si řeší odpověď sám uvnitř run()
            await cmd.run(uhg, interactionOrMessage);
        } else {
            // Klasický command (Message)
            const args = interactionOrMessage.content.slice(uhg.config.prefix.length).trim().split(/ +/);
            args.shift();
            
            const response = await cmd.run(uhg, interactionOrMessage, args.join(" "));
            
            // --- ODESLÁNÍ ODPOVĚDI (Discord + Minecraft) ---
            if (response) {
                // A. Odpověď na Discord
                if (typeof response === 'string') {
                    interactionOrMessage.reply({ content: response, failIfNotExists: false });
                } else if (response.dc) {
                    interactionOrMessage.reply({ embeds: [response.dc], failIfNotExists: false });
                }

                // B. Odpověď do Minecraftu (Bridge)
                // Pokud zpráva přišla z kanálu, který je propojen s MC (Guild/Officer)
                const channelId = interactionOrMessage.channel.id;
                const mcMessage = response.mc || (typeof response === 'string' ? response : null);

                if (mcMessage && uhg.mc.ready) {
                    if (channelId === uhg.config.channels.guild) {
                        uhg.minecraft.send(`/gc ${mcMessage}`);
                    } else if (channelId === uhg.config.channels.officer) {
                        uhg.minecraft.send(`/go ${mcMessage}`);
                    }
                }
            }
        }
    } catch (e) {
        console.error(` [ERROR] Discord Command ${commandName}: `.red, e);
        const errMsg = "Nastala interní chyba při zpracování příkazu.";
        if (isSlash) {
            if (interactionOrMessage.deferred || interactionOrMessage.replied) interactionOrMessage.editReply(errMsg).catch(()=>{});
            else interactionOrMessage.reply({ content: errMsg, ephemeral: true }).catch(()=>{});
        } else {
            interactionOrMessage.reply(errMsg).catch(()=>{});
        }
    }
};
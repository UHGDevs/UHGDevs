/**
 * src/minecraft/commandsHandler.js
 */
module.exports = async (uhg, pmsg) => {
    let content = pmsg.content.trim();
    if (content.startsWith('!')) content = content.slice(1);
    else if (content.trim().startsWith(uhg.config.prefix)) content = content.slice(uhg.config.prefix.length)

    const args = content.split(" ");
    const commandName = args.shift().toLowerCase();
    
    const cmd = uhg.mc.commands.get(commandName) || uhg.mc.commands.get(uhg.mc.aliases.get(commandName));
    if (!cmd) return;

    pmsg.command = commandName;
    pmsg.args = args.join(" ");
    pmsg.verify_data = await uhg.db.getVerify(pmsg.username);

    if (cmd.sb) {
        pmsg.profilName = uhg.getSbProfile(pmsg.args)
        if (uhg.getSbProfile(args[0]));
        else pmsg.username = args[0] || pmsg.username
    } else pmsg.username = args[0] || pmsg.username; 

    try {
        const response = await cmd.run(uhg, pmsg);
        if (!response) return;
        const dcRes = response.dc || response.mc || (typeof response === 'string' ? response : null);
        
        if (dcRes) {
            // A) Pokud příkaz přišel přímo z Discordu -> Reply
            if (pmsg.channel === 'Discord') {
                const replyObj = { failIfNotExists: false };
                
                if (typeof dcRes === 'string') {
                    replyObj.content = dcRes;
                } else if (dcRes instanceof uhg.dc.Embed || dcRes.data) {
                    replyObj.embeds = [dcRes];
                } else {
                    replyObj.content = String(dcRes);
                }
                
                await pmsg.message.reply(replyObj);
            } 
            // B) Pokud příkaz přišel z Minecraftu (Guild/Officer) -> Poslat do Bridge kanálu
            else if (pmsg.channel !== 'DM') {
                const channelType = pmsg.channel === 'Officer' ? 'officer' : 'guild';
                const channel = uhg.dc.cache.channels.get(channelType);
                
                if (channel) {
                    if (typeof dcRes === 'string') channel.send(dcRes);
                    else channel.send({ embeds: [dcRes] });
                }
            }
        }

        // --- 2. MINECRAFT ODPOVĚĎ (Text) ---
        // Vybereme textovou verzi: mc > string
        const mcRes = response.mc || (typeof response === 'string' ? response : null);
        
        if (mcRes) {

            if (!uhg.mc.ready) {
                if (pmsg.channel === 'Discord' && (pmsg.message.channel.id === uhg.config.channels.officer || pmsg.message.channel.id === uhg.config.channels.guild)) {
                    pmsg.message.channel.send("⚠️ **Bot je offline.** Příkaz byl zpracován, ale odpověď do hry nebyla odeslána.").catch(() => {});
                }
                return;
            }


            let target = null;

            // Logika pro určení cíle v Minecraftu
            if (pmsg.channel?.toLowerCase() === 'officer') {
                target = '/go ';
            } else if (pmsg.channel?.toLowerCase() === 'guild') {
                target = '/gc '
            } else if (pmsg.channel === 'DM') {
                target = `/msg ${pmsg.username} `;
            } else if (pmsg.channel === 'Discord' && pmsg.message) {
                // Pokud píšeme z Discordu, určíme chat podle ID kanálu
                if (pmsg.message.channel.id === uhg.config.channels.officer) target = '/go ';
                else if (pmsg.message.channel.id === uhg.config.channels.guild) target = '/gc ';
            }

            if (target) uhg.minecraft.send(target + mcRes);
        }

    } catch (e) {
        console.error(` [ERROR] MC Command ${commandName}: `.red, e);
    }
};
        /* 

        // --- DISCORD ODPOVĚĎ (Embed) ---
        const dcRes = response.dc || response.mc || (typeof response === 'string' ? response : null);
        if (dcRes) {
            // Určíme kanál podle toho, kde se psalo v MC
            const channelType = pmsg.channel === 'Officer' ? 'officer' : 'guild';
            const channel = uhg.dc.cache.channels.get(channelType);
            if (pmsg.channel === 'Discord') {
                pmsg?.message.reply({ [typeof dcRes === 'string' ? 'content' : 'embeds']: [dcRes], failIfNotExists: false });
            } else if (pmsg.channel !== 'DM' && channel) {
                // Poslat Embed na Discord jako reakci na MC příkaz
                channel.send(typeof dcRes === 'string' ? { content: dcRes } : { embeds: [dcRes] });
            }
        }

        // --- MINECRAFT ODPOVĚĎ (Text) ---
        const mcRes = response.mc || (typeof response === 'string' ? response : null);
        if (mcRes) {
            let target = pmsg?.channel?.toLowerCase() === 'officer' ? '/go ' : (pmsg?.channel === 'DM' ? `/msg ${pmsg.username} ` : '/gc ');;
            if (pmsg?.message?.channel?.id == uhg.config.channels.officer) target = '/go ';
            else if (pmsg?.message?.channel?.id == uhg.config.channels.guild) target = '/gc ';
            uhg.minecraft.send(target + mcRes);
        }
    } catch (e) {
        console.error(` [ERROR] MC Command ${commandName}: `.red, e);
    }
};

*/
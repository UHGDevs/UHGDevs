/**
 * src/discord/events/messageCreate.js
 */

const emoji = require('node-emoji');
module.exports = async (uhg, message) => {
    if (message.author.bot) return;

    const guildChan = uhg.config.channels.guild;
    const offiChan = uhg.config.channels.officer;

    if (message.channel.id === guildChan || message.channel.id === offiChan) {

         if (!uhg.mc.ready) {
            return message.reply({ 
                content: "⚠️ **Bot je offline** (Minecraft). Zpráva nebyla odeslána do hry.", 
                failIfNotExists: false 
            }).then(msg => {
                //Smazat varování po 30s, ať nezasírá chat
                setTimeout(() => msg.delete().catch(() => {}), 30000);
            });
        }


        if (uhg.filterMessage(message.content)) {
            return message.reply({ content: "Zpráva obsahuje blokované slovo.", failIfNotExists: false });
        }

        const dbUser = await uhg.db.getVerify(message.author.id);
        const nickname = dbUser ? dbUser.username : (message.member?.username || message.author.username);
        
        // --- ZPRACOVÁNÍ TEXTU ---

        if (message.reference) {
            try {
                // Načteme původní zprávu
                const repliedMsg = await message.fetchReference().catch(() => null);
                if (repliedMsg) {
                    // Zjistíme jméno autora původní zprávy (stejná logika: DB > Nickname > Username)
                    const dbReplied = await uhg.db.getVerify(repliedMsg.author.id);
                    const repliedName = dbReplied 
                        ? dbReplied.username 
                        : (repliedMsg.member?.username || repliedMsg.author.username);
                    
                    nickname = `${nickname} replied to ${repliedName}`;
                }
            } catch (e) {}
        }
        
        // 1. Převod Discord Custom Emojis (<:nazev:ID> -> :nazev:)
        // Regex chytne <, volitelně 'a' (animované), :, jméno, :, ID, >
        let contentForMC = message.content.replace(/<a?:(\w+):\d+>/g, ':$1:');

        // 2. Převod Unicode Emojis (😂 -> :joy:)
        contentForMC = emoji.unemojify(contentForMC);

        // 3. Převod Pingů na Jména (@ID -> @Jméno)
        // (Používáme upravený contentForMC, ne message.content)
        contentForMC = await discordPingsToNames(uhg, contentForMC, message.guild);
        
        // 4. Oříznutí délky
        contentForMC = contentForMC.slice(0, 200);
        
        const mcCmd = message.channel.id === offiChan ? "/go" : "/gc";
        uhg.minecraft.send(`${mcCmd} ${nickname}: ${contentForMC}`)
        
        if (message.content?.trim().startsWith(uhg.config.prefix) || message.content.startsWith('!')) {
        const args = message.content.startsWith('!') ? message.content.slice(1).trim().split(/ +/) : message.content.slice(uhg.config.prefix.length).trim().split(/ +/);
        message.commandNameFromPrefix = args[0].toLowerCase();
        require('../commandsHandler')(uhg, message);
    }

        return;
    }

    if (message.content.startsWith(uhg.config.prefix)) {
        const args = message.content.slice(uhg.config.prefix.length).trim().split(/ +/);
        message.commandNameFromPrefix = args[0].toLowerCase();
        require('../commandsHandler')(uhg, message);
    }

    if (!message.guild) {
        let embed = ['image/png', 'image/jpeg'].some(v => message.attachments.first()?.contentType?.includes(v)) ? { title: `${message.author.username}'s dm`, description: message.content, image: { url: message.attachments.first().url } } : { title: `${message.author.username}'s dm` , description: message.content }
        uhg.dc.cache.channels.get('dm')?.send({ 
            embeds: [embed] 
        });
    }
};

/**
 * Převede Discord zmínky na text pro Minecraft
 */
async function discordPingsToNames(uhg, text, guild) {
    let msg = text;
    const matches = msg.match(/<@!?(\d+)>/g); 
    if (!matches) return msg;

    for (const match of matches) {
        const id = match.replace(/[<@!>]/g, '');
        
        const dbUser = await uhg.db.getVerify(id);
        if (dbUser) {
            msg = msg.replace(match, `@${dbUser.username}`);
            continue;
        }

        const member = guild?.members.cache.get(id);
        if (member) {
            msg = msg.replace(match, `@${member.nickname || member.user.username}`);
            continue;
        }

        const user = uhg.dc.client.users.cache.get(id);
        if (user) msg = msg.replace(match, `@${user.username}`);
    }
    return msg;
}
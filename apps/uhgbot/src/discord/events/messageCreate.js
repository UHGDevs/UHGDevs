/**
 * src/discord/events/messageCreate.js
 */
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
        const nickname = dbUser ? dbUser.nickname : (message.member?.nickname || message.author.username);
        
        // PŘEVOD PINGŮ NA JMÉNA (<@ID> -> @Jméno)
        let contentForMC = await discordPingsToNames(uhg, message);
        
        const mcCmd = message.channel.id === offiChan ? "/go" : "/gc";
        uhg.minecraft.send(`${mcCmd} ${nickname}: ${contentForMC}`);
        
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
        uhg.dc.cache.channels.get('logs')?.send({ 
            embeds: [embed] 
        });
    }
};

/**
 * Převede Discord zmínky na text pro Minecraft
 */
async function discordPingsToNames(uhg, message) {
    let msg = message.content;
    const matches = msg.match(/<@!?(\d+)>/g); // Najde <@ID> i <@!ID>
    if (!matches) return msg;

    for (const match of matches) {
        const id = match.replace(/[<@!>]/g, '');
        
        // 1. Zkusíme naši DB verifikací (získáme MC nick)
        const dbUser = await uhg.db.getVerify(id);
        if (dbUser) {
            msg = msg.replace(match, `@${dbUser.nickname}`);
            continue;
        }

        // 2. Fallback na jméno na Discord serveru
        const member = message.guild?.members.cache.get(id);
        if (member) {
            msg = msg.replace(match, `@${member.nickname || member.user.username}`);
            continue;
        }
    }
    return msg;
}
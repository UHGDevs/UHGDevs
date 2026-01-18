/**
 * src/minecraft/handler.js
 */
const bridge = require('./bridge');

module.exports = async (uhg, raw, motd) => {
    let cleanMsg = uhg.clear(raw).trim();
    

    if (uhg.config.mc_all_logs) {
        const devChannel = uhg.dc.cache.channels.get('bot');
        //if (devChannel) devChannel.send(`\`[MC DEBUG]\` ${cleanMsg}`).catch(() => {});
        console.log(` [MC DEBUG] `.bgBlue + ` ${cleanMsg}`.blue);
    }

    if (cleanMsg.includes("Please be mindful of Discord links")) {
        // Rozdělíme podle varování a vezmeme jen tu první část (to, co hráč napsal)
        cleanMsg = cleanMsg.split("Please be mindful of Discord links")[0].trim();
    }

    // --- SYSTÉMOVÉ ZPRÁVY (Např. Level Up - pro manažery) ---
    if (cleanMsg.startsWith("The Guild has reached Level")) {
        const logsChannel = uhg.dc.cache.channels.get('logs');
        if (logsChannel) logsChannel.send(`🏆 **${cleanMsg}**`);
    }

    
    // 1. SYSTÉMOVÉ ZPRÁVY (Join, Leave, Level Up)
    // Kontrolujeme je nejdříve, protože nemusí obsahovat "Guild >"
    if (cleanMsg.includes("joined the guild") || 
        cleanMsg.includes("left the guild") || 
        cleanMsg.includes("was kicked from the guild") ||
        cleanMsg.includes("has requested to join the Guild!") ||
        cleanMsg.startsWith("The Guild has reached Level") ||
        cleanMsg == "Already in a guild!" ||
        cleanMsg.endsWith("joined.") && cleanMsg.split(" ").length == 4 ||
        cleanMsg.endsWith("left.") && cleanMsg.split(" ").length == 4 ||
        cleanMsg.startsWith("The guild request from") && cleanMsg.includes("has expired")) {
        
        
        
        if (cleanMsg.includes("has requested to join")) {
           const user = cleanMsg.split(" ")[0];

            const api = await uhg.api.call(user, ["hypixel"]);
            const level = Math.floor(api.hypixel?.level || 0);

            bridge.sendJoinRequest(uhg, user, level, api.hypixel?.links?.DISCORD);
            uhg.minecraft.send(`/go [JOIN] ${user} (Level ${level}) se chce připojit!`);
        } else if (cleanMsg.startsWith("The guild request from") && cleanMsg.includes("has expired")) {
            const user = cleanMsg.split(" ")[4];
            
            // Pokud žádost vypršela, automaticky pošleme pozvánku (invite)
            uhg.minecraft.send(`/g invite ${user}`);
            
            // Informujeme na Discordu v officer kanálu
            const offiChannel = uhg.dc.cache.channels.get('officer');
            if (offiChannel) offiChannel.send(`⚠️ Žádost od **${user}** vypršela. Poslal jsem mu novou pozvánku (\`/g invite\`).`);
            return;
        }

        let channelType = "officer";

        if (cleanMsg.includes("joined the guild") || cleanMsg.includes("left the guild") || cleanMsg.endsWith("joined.") ||cleanMsg.endsWith("left.")) channelType = "guild";

        return bridge.sendInfoToDiscord(uhg, cleanMsg.replace("Guild > ", ""), channelType);
    }

    // 2. CHAT DETEKCE (Guild / Officer)
    if (cleanMsg.includes("Guild >") || cleanMsg.includes("Officer >")) {
        const type = cleanMsg.includes("Guild >") ? "guild" : "officer";
        
        // Regex, který bezpečně najde jméno a zprávu
        const chatRegex = /^(?:Guild|Officer) > (?:\[.*?\] )?(\w+)(?: \[.*?\])?: ([\s\S]*)$/;
        const match = cleanMsg.match(chatRegex);

        if (match) {
            const [, username, content] = match;
            
            // Ignorovat zprávy od bota
            if (uhg.mc.client?.username && username.toLowerCase() === uhg.mc.client.username.toLowerCase()) return;

            // --- DETEKCE RANKU Z MOTD ---
            let rank = "non";
            let plusColor = "c";

            // Hledáme rank v MOTD verzi před jménem hráče
            const parts = motd.split(username);
            const prefixPart = parts[0];

            if (prefixPart.includes("[")) {
                const openB = prefixPart.lastIndexOf("[");
                const closeB = prefixPart.lastIndexOf("]");
                const fullRankRaw = prefixPart.substring(openB, closeB + 1);
                
                rank = uhg.clear(fullRankRaw); // [MVP+]

                if (fullRankRaw.includes("+")) {
                    const plusPos = fullRankRaw.indexOf("+");
                    plusColor = fullRankRaw.charAt(plusPos - 1);
                }
            }

            // Odeslání na Discord
            await bridge.sendToDiscord(uhg, type, username, content, rank, plusColor);
            // Příkaz ve hře
            if (content.trim().startsWith('!') || content.trim().startsWith(uhg.config.prefix)) {
                const handlerChannel = type === 'officer' ? 'Officer' : 'Guild';
                
                require('./commandsHandler')(uhg, { 
                    username, 
                    content: content.trim(), 
                    channel: handlerChannel 
                });
            }
            return;
        }
    }

    // 3. SOUKROMÉ ZPRÁVY
    if (cleanMsg.startsWith("From ")) {
        const dmMatch = cleanMsg.match(/From (?:\[.*?\] )?(\w+): (.*)/);
        if (dmMatch) {
            const [, username, content] = dmMatch;
            require('./commandsHandler')(uhg, { username, content: content.trim(), channel: 'DM' });
        }
    }
};
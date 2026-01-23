/**
 * src/minecraft/handler.js
 */
const bridge = require('./bridge');

module.exports = async (uhg, raw, motd) => {
    let cleanMsg = uhg.clear(raw).trim();
    if (!cleanMsg) return;

    // 1. DEBUG LOG (Pokud je zapnuto v configu)
    if (uhg.config.mc_all_logs) {
        console.log(` [MC DEBUG] `.bgBlue + ` ${cleanMsg}`.blue);
        //const devChannel = uhg.dc.cache.channels.get('bot');
        //if (devChannel) devChannel.send(`\`[MC DEBUG]\` ${cleanMsg}`).catch(() => {});
    }

    // Odstranění Hypixel varování
    if (cleanMsg.includes("Please be mindful of Discord links")) {
        cleanMsg = cleanMsg.split("Please be mindful of Discord links")[0].trim();
    }

    // ============================================================
    // 2. CHAT DETEKCE (Guild / Officer / Private)
    // Toto musí být PRVNÍ. Pokud je to chat od hráče, zpracujeme a RETURN.
    // ============================================================

    // A) GUILD & OFFICER CHAT
    if (cleanMsg.includes("Guild >") || cleanMsg.includes("Officer >")) {
        const type = cleanMsg.includes("Guild >") ? "guild" : "officer";
        
        // Regex vyžaduje dvojtečku ":", kterou systémové zprávy (join/leave) nemají.
        // Tím odlišíme "Hráč: text" od "Hráč joined."
        const chatRegex = /^(?:Guild|Officer) > (?:\[.*?\] )?(\w+)(?: \[.*?\])?: ([\s\S]*)$/;
        const match = cleanMsg.match(chatRegex);

        if (match) {
            const [, username, content] = match;
            
            // Ignorovat zprávy od bota
            if (uhg.mc.client?.username && username.toLowerCase() === uhg.mc.client.username.toLowerCase()) return;

            // --- DETEKCE RANKU Z MOTD ---
            let rank = "non";
            let plusColor = "c";

            const parts = motd.split(username);
            const prefixPart = parts[0];

            if (prefixPart.includes("[")) {
                const openB = prefixPart.lastIndexOf("[");
                const closeB = prefixPart.lastIndexOf("]");
                const fullRankRaw = prefixPart.substring(openB, closeB + 1);
                
                rank = uhg.clear(fullRankRaw); 
                if (fullRankRaw.includes("+")) {
                    const plusPos = fullRankRaw.indexOf("+");
                    plusColor = fullRankRaw.charAt(plusPos - 1);
                }
            }

            // Odeslání na Discord (Bridge)
            await bridge.sendToDiscord(uhg, type, username, content, rank, plusColor);

            // Zpracování příkazu (!prikaz)
            if (content.trim().startsWith('!') || content.trim().startsWith(uhg.config.prefix)) {
                const handlerChannel = type === 'officer' ? 'Officer' : 'Guild';
                require('./commandsHandler')(uhg, { 
                    username, 
                    content: content.trim(), 
                    channel: handlerChannel 
                });
            }
            
            // DŮLEŽITÉ: Tady skončíme, aby se chat neposuzoval jako systémová zpráva
            return;
        }
    }

    // B) SOUKROMÉ ZPRÁVY (DMs)
    if (cleanMsg.startsWith("From ")) {
        const dmMatch = cleanMsg.match(/From (?:\[.*?\] )?(\w+): (.*)/);
        if (dmMatch) {
            const [, username, content] = dmMatch;
            require('./commandsHandler')(uhg, { username, content: content.trim(), channel: 'DM' });
            return;
        }
    }


    // ============================================================
    // 3. SYSTÉMOVÉ ZPRÁVY (Join, Leave, Promote...)
    // Sem se dostaneme jen pokud to NEBYL chat.
    // ============================================================

    // Speciální logování Level Up do manažerského kanálu
    if (cleanMsg.startsWith("The Guild has reached Level")) {
        const logsChannel = uhg.dc.cache.channels.get('logs');
        if (logsChannel) logsChannel.send(`🏆 **${cleanMsg}**`);
    }
    
    const isSystemMsg = 
        cleanMsg.includes("joined the guild") || 
        cleanMsg.includes("left the guild") || 
        cleanMsg.includes("was kicked from the guild") ||
        cleanMsg.includes("was promoted") ||
        cleanMsg.includes("was demoted") ||
        cleanMsg.includes("has requested to join the Guild!") ||
        cleanMsg.startsWith("The Guild has reached Level") ||
        cleanMsg === "Already in a guild!" ||
        (cleanMsg.startsWith("The guild request from") && cleanMsg.includes("has expired")) ||
        (cleanMsg.endsWith("joined.") && cleanMsg.split(" ").length === 4) && !cleanMsg.includes('Friend > ') ||
        (cleanMsg.endsWith("left.") && cleanMsg.split(" ").length === 4) && !cleanMsg.includes('Friend > ') ||
        cleanMsg.includes(" of this week's Guild Quest!");

    if (isSystemMsg) {

        // A. Interaktivní (Join Request)
        if (cleanMsg.includes("has requested to join the Guild!")) {
            // Použijeme Regex pro přesné získání jména
            // Ignoruje [Rank] na začátku, vezme slovo před "has requested"
            // Příklad: "[MVP+] DavidCzPdy has requested..." -> DavidCzPdy
            const requestMatch = cleanMsg.match(/(?:\[.*?\]\s+)?(\w+)\s+has requested to join the Guild!/);
            if (requestMatch) {
                const user = requestMatch[1];
                
                // Stáhneme data
                const api = await uhg.api.call(user, ["hypixel"]);
                
                // Zpracování dat (pokud API selže, dáme defaulty)
                const level = api.success && api.hypixel ? Math.floor(api.hypixel.level) : 0;
                const discordTag = api.success && api.hypixel ? api.hypixel.links.DISCORD : "Nenačteno";
                const prefix = api.success && api.hypixel ? api.hypixel.prefix : null;

                // Pošleme i rank jako argument
                bridge.sendJoinRequest(uhg, user, level, discordTag, prefix);

                // Info do Officer chatu ve hře
                uhg.minecraft.send(`/go [${level}] ${user} se chce připojit do guildy!`);
            }
            return;
        } 
        
        // B. Expired Request (Auto-Invite)
        else if (cleanMsg.startsWith("The guild request from") && cleanMsg.includes("has expired")) {
            const user = cleanMsg.split(" ")[4];
            uhg.minecraft.send(`/g invite ${user}`);
            
            const offiChannel = uhg.dc.cache.channels.get('officer');
            if (offiChannel) offiChannel.send(`⚠️ Žádost od **${user}** vypršela. Poslal jsem mu novou pozvánku.`);
            return;
        }

        // C. Informativní zprávy
        let targetChannel = "officer";

        if (
            cleanMsg.includes("joined the guild") || 
            cleanMsg.includes("left the guild") || 
            cleanMsg.includes("was promoted") || 
            cleanMsg.includes("was demoted") || 
            cleanMsg.startsWith("The Guild has reached Level") ||
            cleanMsg.endsWith("joined.") ||
            cleanMsg.endsWith("left.") ||
            cleanMsg.includes(" of this week's Guild Quest!")
        ) {
            targetChannel = "guild";
        }

        // Odstraníme "Guild > " pro čistší výpis na Discordu
        const finalMsg = cleanMsg.replace(/^Guild > /, "");

        return bridge.sendInfoToDiscord(uhg, finalMsg, targetChannel);
    }
};
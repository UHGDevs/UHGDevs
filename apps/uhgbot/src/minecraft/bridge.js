/**
 * src/minecraft/bridge.js
 */
module.exports = {
    sendToDiscord: async (uhg, channelType, username, content, rank = "non", plusColor = "c") => {
        const channel = uhg.dc.cache.channels.get(channelType); 
        if (!channel) return;

        const colorCode = (plusColor || "c").replace(/[§&]/g, "");
        const serverEmoji = getRankEmoji(uhg.dc.client, "server", "");
        const rankEmoji = getRankEmoji(uhg.dc.client, rank, colorCode);
        
        // Převedeme @nick na <@ID> v textu
        const { msg: processedContent } = await pings(content, uhg);

        await channel.send({
            content: `${serverEmoji}${rankEmoji} **${uhg.dontFormat(username)}:** ${processedContent}`,
            // OPRAVENO: Používáme pouze parse, aby Discord sám našel <@ID> v textu
            allowedMentions: { 
                parse: ['users'], // Toto povolí všechny uživatelské zmínky v textu
                roles: [],        // Toto zakáže pingy rolí
                everyone: false   // Toto zakáže @everyone a @here
            }
        });
    },

    sendInfoToDiscord: async (uhg, text, channelType = 'guild') => {
        const channel = uhg.dc.cache.channels.get(channelType);
        if (!channel) return;
        const serverEmoji = getRankEmoji(uhg.dc.client, "server", "");
        await channel.send({
            content: `${serverEmoji} \`${text}\``,
            allowedMentions: { parse: [] }
        });
    },

    sendJoinRequest: async (uhg, username, level, discordTag) => {
        const channel = uhg.dc.cache.channels.get('officer');
        if (!channel) return;
        const embed = new uhg.dc.Embed()
            .setTitle("Nová žádost o vstup!")
            .setColor("Yellow")
            .setDescription(`**Hráč:** ${uhg.dontFormat(username)}\n**Level:** ${level}\n**Discord:** ${discordTag || 'Nepropojeno'}`);
        
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`gaccept_accept_${username}`).setLabel('PŘIJMOUT').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`gaccept_deny_${username}`).setLabel('ODMÍTNOUT').setStyle(ButtonStyle.Danger)
        );
        await channel.send({ embeds: [embed], components: [buttons] });
    }
};

function getRankEmoji(client, rank, color) {
    let emojiNames = [];
    let gap = "";

    // Vyčištění kódu barvy (např. '§5' -> '5')
    const c = color?.replace(/[§&]/g, "");

    if (rank === "server") {
        gap = "_ _ _ _ _ _ "; // 6 mezer pro systémové zprávy
        emojiNames = ["server1", "server2", "server3", "server4", "server5"];
    } else if (rank.includes("MVP++")) {
        gap = ""; // Žádné mezery, rank je dlouhý
        emojiNames = ["gmvp1", "gmvp2", `gmvp_${c}_1`, `gmvp_${c}_2` ];
    } else if (rank.includes("MVP+")) {
        gap = ""; // Žádné mezery, rank je dlouhý
        emojiNames = ["mvp1", "mvp2", "mvp3", `mvp_${c}`];
    } else if (rank.includes("MVP")) {
        gap = "_ _ _ _ _ _ "; // 6 mezer pro vyrovnání 3-ikonového ranku
        emojiNames = ["mvp1b", "mvp2b", "mvp3b"];
    } else if (rank.includes("VIP+")) {
        gap = "_ _ _ _ _ _ _ _ "; // 8 mezer
        emojiNames = ["vip1p", "vip2p", "vip3p"];
    } else if (rank.includes("VIP")) {
        gap = "_ _ _ _ "; // 4 mezery
        emojiNames = ["vip1", "vip2", "vip3"];
    } else if (rank.includes("YOUTUBE")) {
        gap = "";
        emojiNames = ["yt1", "yt2", "yt3", "yt4", "yt5"];
    }

    // Vyhledání emotikonů v Discordu
    const emojis = emojiNames.map(name => {
        const found = client.emojis.cache.find(e => e.name === name);
        return found ? found.toString() : "";
    }).filter(n => n !== "");

    // Fallback: Pokud bota na serveru s emotikony nemáš, nebo emoji chybí
    if (emojis.length === 0) {
        if (rank === "server") return " 🛡️ "; // Náhradní ikona pro serverové info
        if (rank === "non") return "_ _ _ _ _ _ _ _ _ _ _ _ "; // Mezera pro hráče bez ranku
        return gap + `**${rank}** `;
    }

    // Spojíme mezeru (gap) a ikony ranku
    return gap + emojis.join("");
}

/**
 * PŘEVOD @NICK -> <@ID>
 * Prochází zprávu a hledá shody v DB verify
 */
async function pings(message, uhg) {
    if (!message.includes("@")) return { msg: message, ids: [] };
    
    let msg = message;
    let mentionedIds = [];
    const words = msg.split(" ");
    
    for (let word of words) {
        if (word.startsWith("@") && word.length > 1) {
            // ODSTRANÍME vše, co není písmeno, číslo nebo podtržítko (standard pro MC nicky)
            let nick = word.substring(1).replace(/[^a-zA-Z0-9_]/g, "");
            
            // Hledáme v DB
            let user = await uhg.db.getVerify(nick);
            
            if (user) {
                // Nahradíme @nick (včetně původní interpunkce) za zmínku
                // Použijeme regex, který najde @nick i když za ním následuje tečka/čárka
                const searchRegex = new RegExp(`@${nick}\\b`, 'gi');
                msg = msg.replace(searchRegex, `<@${user._id}>`);
                mentionedIds.push(user._id);
            }
        }
    }

    return { msg: msg, ids: mentionedIds };
}
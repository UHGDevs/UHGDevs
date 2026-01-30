/**
 * src/discord/events/clientReady.js
 */

const { PermissionFlagsBits } = require('discord.js');

module.exports = async (uhg, client) => {
    console.log(`--------------------------------------------------`.gray);
    console.log(` [ONLINE] `.bgGreen.black + ` Discord Bot je připraven jako ${client.user.tag}`.bold.green);
    console.log(`--------------------------------------------------`.gray);

    const activityText = uhg.config.activity || 'UHG bot';
    client.user.setActivity(activityText, { type: 3 });

    // Pomocná funkce pro převod textových typů na číselné (D.js v14 vyžaduje čísla)
    const typeMap = {
        'SUB_COMMAND': 1, 'SUB_COMMAND_GROUP': 2, 'STRING': 3, 'INTEGER': 4,
        'BOOLEAN': 5, 'USER': 6, 'CHANNEL': 7, 'ROLE': 8, 'MENTIONABLE': 9,
        'NUMBER': 10, 'ATTACHMENT': 11
    };

    const fixTypes = (options) => {
        return options.map(opt => {
            // Pokud je typ string (např. "STRING"), změníme ho na číslo (např. 3)
            if (typeof opt.type === 'string') opt.type = typeMap[opt.type.toUpperCase()] || opt.type;
            // Pokud má volba další pod-možnosti (sub-commandy), opravíme je taky
            if (opt.options) opt.options = fixTypes(opt.options);
            return opt;
        });
    };

    const commandsData = uhg.dc.slash.map(cmd => {
        const data = {
            name: cmd.name,
            description: cmd.description || "UHG Command",
            options: cmd.options ? fixTypes(JSON.parse(JSON.stringify(cmd.options))) : []
        };

        // Pokud má příkaz v souboru definovaná permissions, nastavíme mu defaultní schování.
        // Discord API nebere konkrétní ID, ale jen "typ" oprávnění.
        // Nastavíme 'ManageGuild' (Správa serveru) jako pojistku pro viditelnost.
        if (cmd.permissions && cmd.permissions.length > 0) {
            data.default_member_permissions = PermissionFlagsBits.ManageGuild.toString();
        }

        return data;
    });

    // 2. Globální registrace (pro všechny servery)
    try {
        await client.application.commands.set(commandsData);
        console.log(` [DISCORD] `.bgCyan.black + ` Globální příkazy (${commandsData.length}) odeslány na API.`.cyan);
    } catch (e) {
        console.error(" [ERROR] Chyba globální registrace:".red, e.message);
    }

    // 3. Okamžitá registrace pro prioritní servery
    // Tyto servery budou mít příkazy aktualizované hned po restartu/reloadu
    const priorityGuilds = [
        "455751845319802880", // Hlavní UHG
        "758650512827613195"  // Testovací server
    ];

    for (const guildId of priorityGuilds) {
        const guild = client.guilds.cache.get(guildId);
        let test = false;
        if (guild && test) {
            try {
                await guild.commands.set(commandsData);
                console.log(` [DISCORD] `.bgCyan.black + ` Příkazy aktualizovány pro guildu: ${guild.name}`.cyan);
            } catch (e) {
                console.error(` [ERROR] Chyba registrace pro ${guildId}:`.red, e.message);
            }
        } else if (guild) {
                const localCmds = await guild.commands.fetch();
                if (localCmds.size > 0) {
                    await guild.commands.set([]); // Smaže lokální kopie
                    console.log(` [CLEANUP] Smazány lokální duplicity na serveru: ${guild.name}`.yellow);
                }
        }
    }

    if (uhg.config.channels) {
        uhg.dc.cache.channels.clear();
        for (let [name, id] of Object.entries(uhg.config.channels)) {
            if (name.endsWith('_dev')) continue;

            const channel = client.channels.cache.get(id);
            if (channel) {
                uhg.dc.cache.channels.set(name, channel);
            }
        }
        console.log(` [CACHE] Kanály logs a bot načteny do paměti.`.magenta);
    }

    await uhg.roles.loadBadges();
    if (uhg.config.minecraft && !uhg.mc.client) {
        uhg.minecraft.init();
    }
};
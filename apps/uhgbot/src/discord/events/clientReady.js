/**
 * src/discord/events/clientReady.js
 * Spouští se při startu bota (v14 kompatibilní).
 */

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

    // Registrace Slash příkazů
    const guild = client.guilds.cache.get(uhg.config.guildId);
    if (guild) {
        try {
            const commandsData = uhg.dc.slash.map(cmd => {
                return {
                    name: cmd.name,
                    description: cmd.description || "UHG Command",
                    // Oprava typů v opcích
                    options: cmd.options ? fixTypes(JSON.parse(JSON.stringify(cmd.options))) : []
                };
            });

            await guild.commands.set(commandsData);
            console.log(` [DISCORD] `.bgCyan.black + ` ${commandsData.length} Slash příkazů zaregistrováno.`.cyan);
        } catch (e) {
            console.error(" [ERROR] ".bgRed + " Chyba registrace Slash příkazů:".red);
            console.error(e);
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
/**
 * src/discord/commandsSlash/config.js
 * Správa konfigurace (config.json) přímo z Discordu.
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'config',
    description: 'Zobrazí nebo upraví nastavení bota',
    permissions: [
        { type: 'USER', id: '378928808989949964' }, 
        { type: 'USER', id: '312861502073995265' }
    ],
    options: [
        {
            name: 'setting',
            description: 'Které nastavení chceš změnit?',
            type: 3, // STRING
            required: false,
            autocomplete: true
        },
        {
            name: 'value',
            description: 'Nová hodnota (true/false, text, číslo)',
            type: 3, // STRING
            required: false
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const settingKey = interaction.options.getString('setting');
        const newValueRaw = interaction.options.getString('value');

        const config = uhg.config;

        // 1. ZOBRAZIT CELÝ CONFIG
        if (!settingKey) {
            // Pro hezčí výpis zploštíme objekt
            const flatConfig = flattenObject(config);
            const desc = Object.entries(flatConfig)
                .map(([k, v]) => `**${k}**: \`${v}\``)
                .join('\n');

            const embed = new uhg.dc.Embed()
                .setTitle('🔧 Aktuální Konfigurace')
                .setColor('Grey')
                .setDescription(desc.slice(0, 4096)) // Ochrana proti limitu embedu
                .setFooter({ text: "Pro změnu použij /config [setting] [value]" });

            return interaction.editReply({ embeds: [embed] });
        }

        // 2. ZOBRAZIT KONKRÉTNÍ HODNOTU
        if (newValueRaw === null) {
            const currentValue = getValueByPath(config, settingKey);
            
            if (currentValue === undefined) {
                return interaction.editReply({ content: `❌ Nastavení \`${settingKey}\` neexistuje.` });
            }

            return interaction.editReply({ 
                embeds: [new uhg.dc.Embed()
                    .setTitle(`🔧 Detail nastavení`)
                    .setColor('Blue')
                    .setDescription(`**${settingKey}**\n\nSoučasná hodnota: \`${JSON.stringify(currentValue)}\`\nTyp: \`${typeof currentValue}\``)
                ]
            });
        }

        // 3. ÚPRAVA HODNOTY
        let newValue = newValueRaw;

        // Automatická konverze typů
        if (newValueRaw.toLowerCase() === 'true') newValue = true;
        else if (newValueRaw.toLowerCase() === 'false') newValue = false;
        else if (!isNaN(Number(newValueRaw)) && newValueRaw.trim() !== '') newValue = Number(newValueRaw);

        // Zápis do objektu (podpora vnoření "time/elites")
        const success = setValueByPath(config, settingKey, newValue);

        if (!success) {
            return interaction.editReply({ content:  `❌ Cesta \`${settingKey}\` neexistuje nebo je neplatná.` });
        }


        const embed = new uhg.dc.Embed()
            .setTitle('✅ Nastavení změněno')
            .setColor('Green')
            .addFields(
                { name: 'Klíč', value: `\`${settingKey}\``, inline: true },
                { name: 'Nová hodnota', value: `\`${newValue}\``, inline: true }
            );

        return interaction.editReply({ embeds: [embed] });

    },

    /**
     * AUTOCOMPLETE: Našeptává klíče z configu
     */
    autocomplete: async (uhg, interaction) => {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        
        const flatConfig = flattenObject(uhg.config);
        const keys = Object.keys(flatConfig);

        // Filtrování výsledků
        const filtered = keys
            .filter(key => key.toLowerCase().includes(focusedValue))
            .slice(0, 25); // Discord limit

        await interaction.respond(
            filtered.map(choice => ({ name: `${choice}: ${flatConfig[choice]}`, value: choice }))
        );
    }
};

// --- POMOCNÉ FUNKCE PRO PRÁCI S OBJEKTY ---

/**
 * Převede vnořený objekt na plochý (např. {time: {elites: true}} -> "time/elites": true)
 */
function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '/' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

/**
 * Získá hodnotu z objektu podle cesty "a/b/c"
 */
function getValueByPath(obj, path) {
    return path.split('/').reduce((o, k) => (o || {})[k], obj);
}

/**
 * Nastaví hodnotu v objektu podle cesty "a/b/c"
 * Vrací false, pokud cesta neexistuje.
 */
function setValueByPath(obj, path, value) {
    const keys = path.split('/');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            return false;
        }
        current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    return true;
}
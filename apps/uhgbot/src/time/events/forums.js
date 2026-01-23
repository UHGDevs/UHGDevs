/**
 * src/time/events/forums.js
 * Sledování Hypixel fóra s výběrem rolí pro ping.
 */

const Parser = require('rss-parser');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: "forums",
    description: "Sleduje novinky na Hypixel fóru a spravuje oznámení s výběrem rolí",
    emoji: "📜",
    time: "0 */2 * * * *", 
    ignore: '* * * * * *',
    onstart: true,

    run: async (uhg) => {
        const parser = new Parser();
        const ADMIN_CHAT_ID = '530496801782890527';
        const adminChannel = uhg.dc.client.channels.cache.get(ADMIN_CHAT_ID);

        const MAX_AGE = 1000 * 60 * 60 * 24 * 2; // 2 dny 

        const feeds = [
            { url: 'https://hypixel.net/forums/news-and-announcements.4/-/index.rss', type: 'Main' },
            { url: 'https://hypixel.net/forums/skyblock-patch-notes.158/-/index.rss', type: 'SkyBlock' }
        ];

        for (const feedInfo of feeds) {
            const feed = await parser.parseURL(feedInfo.url);
            
            for (const item of feed.items) {
                const pubDate = new Date(item.pubDate || item.isoDate);
                if ((Date.now() - pubDate.getTime()) > MAX_AGE) {
                    continue; 
                }

                const guid = item.guid.split('/').pop() || item.guid;

                // Kontrola v DB
                const exists = await uhg.db.run.get("general", "forums", { guid: guid });
                if (exists.length > 0) continue;

                // Uložení nového článku
                const forumData = {
                    _id: guid,
                    guid: guid,
                    title: item.title,
                    link: item.link,
                    author: item.creator,
                    type: feedInfo.type,
                    timestamp: pubDate.getTime() || Date.now(),
                    announced: false
                };
                await uhg.db.run.post("general", "forums", forumData);

                // Odeslání do ADMIN CHATU k rozhodnutí
                if (adminChannel) {
                    const embed = new uhg.dc.Embed()
                        .setTitle(`NOVÝ FORUM ANNOUNCEMENT: ${feedInfo.type}`)
                        .setURL(item.link)
                        .setDescription(`**${item.title}**\n\nAutor: \`${item.creator}\``)
                        .setColor(feedInfo.type === 'SkyBlock' ? 0x00AA00 : 0xFFAA00)
                        .addFields({ name: 'Role k označení', value: '*Zatím nevybráno*' })
                        .setTimestamp(forumData.timestamp);

                    const buttons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`forums_setup_${guid}`)
                            .setLabel('NASTAVIT PING')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`forums_ignoruj_${guid}`)
                            .setLabel('IGNOROVAT')
                            .setStyle(ButtonStyle.Secondary)
                    );

                    await adminChannel.send({ embeds: [embed], components: [buttons] });
                }
            }
        }
    },

    // --- INTERAKCE (TLAČÍTKA A MENU) ---

    /**
     * Zobrazí menu pro výběr rolí
     */
    setup: async (uhg, interaction) => {
        const guid = interaction.customId.split('_')[2];
        
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`forums_select_${guid}`)
                .setPlaceholder('Vyber role pro označení')
                .setMinValues(1)
                .setMaxValues(4)
                .addOptions([
                    { label: 'Hypixel Oznámení', value: '1003713647845052466' },
                    { label: 'SkyBlock Oznámení', value: '1003713511710543952' },
                    { label: 'Discord Oznámení', value: '1003713161238679652' },
                    { label: 'Neoznačovat', value: 'none' }
                ])
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`forums_ignoruj_${guid}`).setLabel('ZRUŠIT').setStyle(ButtonStyle.Danger)
        );

        await interaction.update({ components: [menu, buttons] });
    },

    /**
     * Zpracuje vybrané role a ukáže potvrzovací tlačítko
     */
    select: async (uhg, interaction) => {
        const guid = interaction.customId.split('_')[2];
        const values = interaction.values;
        
        let pings = [];
        if (!values.includes('none')) {
            values.forEach(v => pings.push(v === 'everyone' ? '@everyone' : `<@&${v}>`));
        }

        const embed = uhg.dc.Embed.from(interaction.message.embeds[0])
            .setFields({ name: 'Vybrané role k pingu', value: pings.join(' ') || '*Žádné (pouze odkaz)*' });

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`forums_publish_${guid}`)
                .setLabel('POTVRDIT A POSLAT')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`forums_setup_${guid}`)
                .setLabel('ZMĚNIT ROLE')
                .setStyle(ButtonStyle.Secondary)
        );

        // Uložíme si vybrané pings do zprávy (dočasně)
        await interaction.update({ embeds: [embed], components: [confirmRow] });
    },

    /**
     * Finální odeslání do guild kanálu
     */
    publish: async (uhg, interaction) => {
        const guid = interaction.customId.split('_')[2];
        const data = await uhg.db.run.get("general", "forums", { guid: guid }).then(res => res[0]);

        if (!data || data.announced) return interaction.reply({ content: "Chyba nebo již publikováno.", ephemeral: true });

        const channel = uhg.dc.client.channels.cache.get('468084524023021568');
        if (!channel) return interaction.reply({ content: "Kanál nenalezen.", ephemeral: true });

        // Vytáhneme pings z embedu v admin chatu
        const pings = interaction.message.embeds[0].fields[0].value;
        const cleanPings = pings === '*Žádné (pouze odkaz)*' ? '' : pings;

        const newsEmbed = new uhg.dc.Embed()
            .setTitle(data.title)
            .setURL(data.link)
            .setColor(data.type === 'SkyBlock' ? 0x00AA00 : 0xFFAA00)
            .setDescription(`Na Hypixelu vyšel nový článek v kategorii **${data.type}**!\n\n🔗 **[Zobrazit článek na webu](${data.link})**`)
            .setTimestamp(data.timestamp);

        // Odeslání do hlavního chatu
        await channel.send({ 
            content: cleanPings, 
            embeds: [newsEmbed],
            allowedMentions: { parse: ['everyone', 'roles'] }
        });

        await uhg.db.run.update("general", "forums", { guid: guid }, { announced: true });

        await interaction.update({ 
            content: `✅ Odesláno do <#${channel.id}> uživatelem ${uhg.dontFormat(interaction.user.username)}`, 
            embeds: [], 
            components: [] 
        });
    },

    ignoruj: async (uhg, interaction) => {
        await interaction.update({ content: `❌ Ignorováno (${uhg.dontformat(interaction.user.username)})`, embeds: [], components: [] });
    }
};
/**
 * src/time/events/forums.js
 * Sledování Hypixel fóra s novou DB a opravenými interakcemi.
 */

const Parser = require('rss-parser');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: "forums",
    description: "Sleduje novinky na Hypixel fóru",
    emoji: "📜",
    time: "0 */2 * * * *", // Každé 2 minuty
    onstart: true,

    run: async (uhg) => {
        const parser = new Parser();
        const ADMIN_CHAT_ID = '530496801782890527';
        const adminChannel = uhg.dc.client.channels.cache.get(ADMIN_CHAT_ID);

        // Maximální stáří příspěvku pro zpracování (2 dny)
        const MAX_AGE = 1000 * 60 * 60 * 24 * 2; 

        const feeds = [
            { url: 'https://hypixel.net/forums/news-and-announcements.4/-/index.rss', type: 'Main' },
            { url: 'https://hypixel.net/forums/skyblock-patch-notes.158/-/index.rss', type: 'SkyBlock' }
        ];

        for (const feedInfo of feeds) {
            try {
                const feed = await parser.parseURL(feedInfo.url);
                
                // Získání nejvyššího GUID v aktuálním feedu pro detekci bumped starých příspěvků
                const allGuids = feed.items.map(item => {
                    const id = item.link.split('.').pop().replace('/', '') || item.guid;
                    return parseInt(id);
                }).filter(id => !isNaN(id));
                const maxGuid = allGuids.length > 0 ? Math.max(...allGuids) : 0;

                for (const item of feed.items) {
                    const pubDate = new Date(item.pubDate || item.isoDate);
                    
                    // 1. OCHRANA PROTI STARÝM PŘÍSPĚVKŮM
                    if (isNaN(pubDate.getTime()) || (Date.now() - pubDate.getTime()) > MAX_AGE) {
                        // console.log(` [FORUMS] Přeskočeno (příliš staré): ${item.title} (${item.pubDate || item.isoDate})`);
                        continue; 
                    }

                    // Získání ID vlákna z linku
                    const guidFromLink = item.link.split('.').pop().replace('/', '');
                    const guid = isNaN(parseInt(guidFromLink)) ? (item.guid || guidFromLink) : guidFromLink;
                    const numericGuid = parseInt(guid);

                    // 1.5 OCHRANA PROTI BUMPED STARÝM PŘÍSPĚVKŮM (pokud je ID o víc než 10 000 nižší než nejnovější v RSS)
                    // Hypixel někdy aktualizuje pubDate u starých článků, ale ID vlákna (GUID) zůstává staré.
                    if (!isNaN(numericGuid) && maxGuid > 0 && (maxGuid - numericGuid) > 10000) {
                        // console.log(` [FORUMS] Přeskočen starý bumped příspěvek: ${item.title} (ID: ${guid})`);
                        continue;
                    }

                    // 2. KONTROLA V DB (používáme novou kolekci v DB 'data')
                    // Hledáme podle stringu guid i podle číselného ID (pro kompatibilitu se starou DB)
                    const exists = await uhg.db.findOne("forums", { $or: [{ _id: guid }, { _id: numericGuid }] });
                    if (exists) continue;

                    // 3. ULOŽENÍ NOVÉHO ČLÁNKU
                    const forumData = {
                        _id: guid,
                        title: item.title,
                        link: item.link,
                        author: item.creator || "Hypixel Staff",
                        type: feedInfo.type,
                        timestamp: pubDate.getTime(),
                        announced: false // Ještě neposláno do hlavního kanálu
                    };
                    await uhg.db.updateOne("forums", { _id: guid }, forumData);

                    // 4. ODESLÁNÍ DO ADMIN CHATU K ROZHODNUTÍ
                    if (adminChannel) {
                        const embed = new uhg.dc.Embed()
                            .setTitle(`📰 NOVÝ FORUM POST: ${feedInfo.type}`)
                            .setURL(item.link)
                            .setDescription(`**${item.title}**\n\nAutor: \`${forumData.author}\``)
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
            } catch (err) {
                console.error(` [FORUMS] Chyba při parsování ${feedInfo.type}:`, err.message);
            }
        }
    },

    // --- INTERAKCE ---

    /**
     * Výběr rolí (Menu)
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
                    { label: 'Hypixel Oznámení', value: '1003713647845052466', emoji: '🎮' },
                    { label: 'SkyBlock Oznámení', value: '1003713511710543952', emoji: '🍎' },
                    { label: 'Discord Oznámení', value: '1003713161238679652', emoji: '💬' },
                    { label: 'Bez pingu (jen odkaz)', value: 'none', emoji: '🔕' }
                ])
        );

        await interaction.update({ components: [menu] });
    },

    /**
     * Potvrzení výběru
     */
    select: async (uhg, interaction) => {
        const guid = interaction.customId.split('_')[2];
        const values = interaction.values;
        
        let pings = [];
        if (!values.includes('none')) {
            values.forEach(v => pings.push(`<@&${v}>`));
        }

        const embed = uhg.dc.Embed.from(interaction.message.embeds[0])
            .setFields({ name: 'Vybrané role k pingu', value: pings.join(' ') || '*Žádné (pouze odkaz)*' });

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`forums_publish_${guid}`)
                .setLabel('POTVRDIT A PUBLIKOVAT')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`forums_setup_${guid}`)
                .setLabel('ZMĚNIT ROLE')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embed], components: [confirmRow] });
    },

    /**
     * Finální odeslání do hlavního kanálu
     */
    publish: async (uhg, interaction) => {
        const guid = interaction.customId.split('_')[2];
        const data = await uhg.db.findOne("forums", { _id: guid });

        if (!data || data.announced) return interaction.reply({ content: "Příspěvek neexistuje nebo již byl publikován.", flags: [MessageFlags.Ephemeral] });

        // Deferujeme hned, abychom předešli timeoutu (3s)
        await interaction.deferUpdate();

        try {
            // Kanál pro novinky (#news / #oznameni)
            const channel = uhg.dc.client.channels.cache.get('468084524023021568');
            if (!channel) return interaction.followUp({ content: "Cílový kanál nebyl nalezen.", flags: [MessageFlags.Ephemeral] });

            // Vytáhneme pings z dříve připraveného embedu
            const oldEmbed = interaction.message.embeds[0];
            const pings = (oldEmbed && oldEmbed.fields && oldEmbed.fields[0]) ? oldEmbed.fields[0].value : '';
            const cleanPings = pings === '*Žádné (pouze odkaz)*' ? '' : pings;

            const newsEmbed = new uhg.dc.Embed()
                .setTitle(data.title)
                .setURL(data.link)
                .setColor(data.type === 'SkyBlock' ? 0x00AA00 : 0xFFAA00)
                .setDescription(`Na Hypixelu vyšel nový článek v kategorii **${data.type}**!\n\n🔗 **[Zobrazit příspěvek na fóru](${data.link})**`)
                .setFooter({ text: `Autor: ${data.author}` })
                .setTimestamp(data.timestamp);

            await channel.send({ 
                content: cleanPings, 
                embeds: [newsEmbed],
                allowedMentions: { parse: ['roles'] }
            });

            // Označíme v DB jako vyřízené
            await uhg.db.updateOne("forums", { _id: guid }, { announced: true });

            await interaction.editReply({ 
                content: `✅ Publikováno v <#${channel.id}> uživatelem **${uhg.dontFormat(interaction.user.username)}**`, 
                embeds: interaction.message.embeds, 
                components: [] 
            });
        } catch (err) {
            console.error(" [FORUMS] Chyba při publikování:", err);
            await interaction.followUp({ content: `Došlo k chybě při publikování: ${err.message}`, flags: [MessageFlags.Ephemeral] });
        }
    },

    /**
     * Ignorování příspěvku
     */
    ignoruj: async (uhg, interaction) => {
        const guid = interaction.customId.split('_')[2];
        
        await interaction.deferUpdate();

        try {
            // DŮLEŽITÉ: I ignorovaný musíme označit jako announced: true, aby se nevracel v dalším cyklu!
            await uhg.db.updateOne("forums", { _id: guid }, { announced: true });

            await interaction.editReply({ 
                content: `❌ Ignorováno uživatelem **${uhg.dontFormat(interaction.user.username)}**`, 
                embeds: interaction.message.embeds,
                components: [] 
            });
        } catch (err) {
            console.error(" [FORUMS] Chyba při ignorování:", err);
            await interaction.followUp({ content: `Došlo k chybě: ${err.message}`, flags: [MessageFlags.Ephemeral] });
        }
    }
};
/**
 * src/discord/commandsSlash/profile.js
 * Detailní profil hráče (Hypixel Stats + UHG Info)
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: "profile",
    description: "Zobrazí profil hráče (Hypixel & UHG Stats)",
    permissions: [], // Veřejný příkaz
    options: [
        {
            name: "player",
            description: "Jméno hráče",
            type: 3, // STRING
            required: false
        },
        {
            name: "user",
            description: "Discord uživatel",
            type: 6, // USER
            required: false
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply();

        let username = interaction.options.getString("player");
        let targetUser = interaction.options.getUser("user");
        let uuid = null;

        // 1. Zjištění identity (Efektivní DB dotaz)
        if (targetUser) {
            let dbUser = await uhg.db.getVerify(targetUser.id);
            if (dbUser) {
                username = dbUser.nickname;
                uuid = dbUser.uuid;
            } else {
                return interaction.editReply(`❌ Uživatel ${targetUser} není verifikovaný.`);
            }
        } else if (!username) {
            // Self-check
            let dbUser = await uhg.db.getVerify(interaction.user.id);
            if (dbUser) {
                username = dbUser.nickname;
                uuid = dbUser.uuid;
            } else {
                // Pokud není verifikovaný, použijeme jeho Discord jméno jako fallback pro hledání
                username = interaction.member.nickname || interaction.user.username;
            }
        }

        // 2. Volání Sjednoceného API
        // Stáhne Hypixel, Guildu, Online status a Mojang data najednou
        let apiInput = uuid || username;
        let api = await uhg.api.call(apiInput, ["hypixel", "guild", "online"]);

        if (!api.success) {
            return interaction.editReply(`❌ Chyba API: ${api.reason}`);
        }

        // 3. Data z Databáze (Statusy)
        // Zkontrolujeme verifikaci a stats (pokud jsme nehledali přes user argument)
        const verifyData = await uhg.db.getVerify(api.uuid);
        const statsData = await uhg.db.getStats(api.uuid); // Rychlý check v cache/db

        const hp = api.hypixel;
        const guild = api.guild;

        // 4. Sestavení Embedu
        const embed = new uhg.dc.Embed()
            .setTitle(`Profil: ${uhg.dontFormat(api.username)}`)
            .setURL(`https://plancke.io/hypixel/player/stats/${api.username}`)
            .setThumbnail(uhg.getAvatar(api.uuid))
            .setColor(hp.color || 0x55FFFF); // Barva podle ranku (z api.js)

        // -- Sekce: Hypixel Stats --
        const lastLogin = hp.lastLogin ? `<t:${Math.round(hp.lastLogin / 1000)}:R>` : "`API OFF`";
        const firstLogin = hp.firstLogin ? `<t:${Math.round(hp.firstLogin / 1000)}:D>` : "`???`";

        embed.addFields(
            { name: "Rank", value: `${hp.prefix || hp.rank}`, inline: true },
            { name: "Level", value: `${Math.floor(hp.level)}`, inline: true },
            { name: "Karma", value: `${uhg.f(hp.karma)}`, inline: true },
            
            { name: "AP", value: `${uhg.f(hp.aps)}`, inline: true },
            { name: "Jazyk", value: `${hp.userLanguage}`, inline: true },
            { name: "Naposledy online", value: lastLogin, inline: true },
            
            { name: "První připojení", value: firstLogin, inline: false }
        );

        // -- Sekce: Guilda --
        if (guild.guild) {
            // Výpočet GEXP hráče (pokud máme data)
            let gexpInfo = "";
            if (guild.member && guild.member.expHistory) {
                const weeklyGexp = Object.values(guild.member.expHistory).reduce((a, b) => a + b, 0);
                gexpInfo = `\n**Weekly GEXP:** \`${uhg.f(weeklyGexp)}\``;
            }

            embed.addFields({
                name: "Guilda",
                value: `**${guild.name}** [${guild.tag}]\n**Rank:** ${guild.member.rank}\n**Joined:** <t:${Math.round(guild.member.joined / 1000)}:R>${gexpInfo}`,
                inline: false
            });
        } else {
            embed.addFields({ name: "Guilda", value: "Žádná", inline: false });
        }

        // -- Sekce: UHG Status --
        let discordStatus = "🟥 Ne";
        if (verifyData) {
            // Najdeme Discord uživatele na serveru, pokud tam je
            const dcMember = interaction.guild.members.cache.get(verifyData._id);
            discordStatus = `✅ Ano: ${dcMember ? dcMember : `<@${verifyData._id}>`}`;
        }

        let dbStatus = statsData ? "✅ Ano (Sledován)" : "🟥 Ne";
        // Pokud je v DB, přidáme info o poslední aktualizaci
        if (statsData && statsData.updated) {
            dbStatus += ` (<t:${Math.round(statsData.updated/1000)}:R>)`;
        }

        // Discord link z Hypixelu
        let hypixelDiscord = hp.links.DISCORD || "Není nastaven";

        embed.addFields(
            { name: "Discord (Hypixel)", value: `\`${hypixelDiscord}\``, inline: true },
            { name: "Verifikován (UHG)", value: discordStatus, inline: true },
            { name: "V databázi (Stats)", value: dbStatus, inline: true }
        );

        // -- Footer: Online Status --
        let statusText = "Offline";
        if (api.online.online) {
            statusText = `🟢 Online: ${api.online.game || "Lobby"} (${api.online.mode || "Unknown"})`;
            if (api.online.map) statusText += ` - ${api.online.map}`;
        } else {
            statusText = "🔴 Offline";
        }
        
        embed.setFooter({ text: statusText });

        await interaction.editReply({ embeds: [embed] });
    }
};
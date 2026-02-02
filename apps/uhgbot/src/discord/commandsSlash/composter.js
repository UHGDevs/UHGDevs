/**
 * src/discord/commandsSlash/composter.js
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    name: "composter",
    description: "Zobrazí stav tvého composteru a nastaví upozornění",
    options: [
        { 
            name: "notify", 
            description: "Chceš poslat DM, až composter dojde?", 
            type: 5, // BOOLEAN
            required: false 
        }
    ],

    run: async (uhg, interaction) => {
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const notifyOpt = interaction.options.getBoolean("notify");
        
        // 1. KONTROLA VERIFIKACE (Hráč může ovládat pouze sebe)
        const verified = await uhg.db.getVerify(interaction.user.id);
        if (!verified) {
            return interaction.editReply("❌ Musíš být verifikovaný, abys mohl trackovat svůj composter. Použij `/verify`.");
        }

        if (notifyOpt === false) {
            await uhg.db.db.collection("users").updateOne(
                { _id: verified.uuid },
                { $unset: { garden: "" } }
            );
            uhg.db.cache.users.del(verified.uuid);
            return interaction.editReply("🔕 **Upozornění vypnuto** a data o Garden byla odstraněna z tvého profilu.");
        }

        // 2. VOLÁNÍ API (Použijeme cachePath, aby se to v případě chybějících dat v cache stáhlo znovu)
        const api = await uhg.api.call(verified.uuid, ["skyblock"], {
            garden: true, 
            cachePath: 'skyblock/profiles[0]garden/composter' 
        });

        if (!api.success) return interaction.editReply(`❌ Chyba API: ${api.reason}`);

        // 3. ZÍSKÁNÍ DAT Z VYBRANÉHO PROFILU
        const profile = api.skyblock.profiles[0]; // Naše api.call řadí vybraný profil jako první
        const garden = profile?.garden; // Cesta podle tvého nového parseru

        if (!garden || !garden.composter) {
            return interaction.editReply(`❌ Na profilu **${profile?.name || "???"}** nemáš aktivní Composter.`);
        }

        // 4. VÝPOČET
        // (Zde můžeš dosadit reálnou cenu z tvé Bazaar cache, pokud ji máš: uhg.cache.prices.COMPOST)
        const calc = garden.composter

        const embed = new uhg.dc.Embed()
            .setTitle(`Garden Composter: ${uhg.dontFormat(api.username)}`)
            .setDescription(`Sleduji profil: **${profile.name}** (${profile.mode})`)
            .setThumbnail("https://sky.shiiyu.moe/item/COMPOST")
            .setColor(calc.active ? "Green" : "Red")
            .addFields(
                { name: "Stav", value: calc.active ? `🟢 Běží (dojde <t:${Math.round(calc.emptyAt / 1000)}:R>)` : "🔴 Zastaven", inline: false },
                { name: "Aktuálně", value: `\`${uhg.f(calc.compostWaiting)} ks\`\n(\`${uhg.money(calc.prices.now)} coins\`)`, inline: true },
                { name: "Celkem bude", value: `\`${uhg.f(calc.compostAtEnd)} ks\`\n(\`${uhg.money(calc.prices.later)} coins\`)`, inline: true },
                { name: "Api aktualizováno", value: `<t:${Math.round(calc.last_save / 1000)}:R>`, inline: false }
                
            );

        // 5. Zapnutí notifikace (Uložení do DB)
        if (notifyOpt === true) {
            await uhg.db.updateOne("users", { _id: verified.uuid }, {
                "garden.composter_alert": true,
                "garden.emptyAt": calc.emptyAt,
                "garden.alert_sent": false,
                "garden.profile_id": profile.id,
                "garden.profileName": profile.name
            });
            embed.setFooter({ text: "✅ Upozornění zapnuto. Pošlu ti DM, až stroj doběhne." });
        } else {
            embed.setFooter({ text: "Tip: Použij /composter notify:true pro upozornění do DM." });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
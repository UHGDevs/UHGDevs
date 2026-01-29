module.exports = {
    name: "ArenaBrawl",
    aliases: ["ab", "arena", "arenabrawl"],
    run: async (uhg, pmsg) => {
        try {
            // Logika argumentů (basic, deck, ranked)
            let args = pmsg.args.split(" ");
            let targetName = pmsg.username;
            let mode = null; // default

            const modesMap = {
                "deck": ["deck", "setup", "skills", "skilly"],
                "basic": ["basic", "normal", "overall", "základní"],
                "ranked": ["rt", "rating", "pos", "ranked", "position", "pozice"]
            };

            // Zjistíme, jestli první nebo druhý argument je mód
            for (let m in modesMap) {
                if (modesMap[m].includes(args[0]?.toLowerCase())) {
                    mode = m;
                    targetName = args[1] || pmsg.username;
                } else if (modesMap[m].includes(args[1]?.toLowerCase())) {
                    mode = m;
                    targetName = args[0] || pmsg.username;
                }
            }

            const api = await uhg.api.call(targetName, ["hypixel"]);
            if (!api.success) return api.reason;
            const arena = api.hypixel.stats.arena;
            const overall = arena.overall;
            
            // Logika pro "Maxed"
            let maxed = "";
            const upgradesSum = (arena.upgrades.cooldown || 0) + (arena.upgrades.health || 0) + (arena.upgrades.energy || 0) + (arena.upgrades.damage || 0);
            if (upgradesSum === 36) maxed = "[MAXED]";
            // Předpokládáme, že parser vrací rune_levels jako objekt
            if (arena.rune && arena.rune_levels && arena.rune_levels[arena.rune] === 6 && upgradesSum === 36) maxed = "[MAXED+]";

            // MC Zpráva podle módu
            const prefix = `[${uhg.f(overall.wins)}]`;
            const header = `**Arena**: ${prefix} **${api.username}** -`;
            let mcMessage = `${header} ${(arena.offensive[0]+arena.utility[0]+arena.support[0]+arena.ultimate[0]).toUpperCase()} ${maxed}`;

            if (mode === "basic") {
                mcMessage = `${header} ${uhg.f(overall.wins)}Wins ${uhg.f(overall.kills)}Kills ${uhg.f(overall.wlr)}WLR ${maxed}`;
            } else if (mode === "deck") {
                const skills = `${arena.offensive}, ${arena.utility}, ${arena.support}, ${arena.ultimate}`;
                mcMessage = `${header} ${skills}, ${arena.rune} Rune ${maxed}`;
            } else if (mode === "ranked") {
                const rankedMsg = arena.highestrt ? `${uhg.f(arena.highestrt)} Best Rt, #${uhg.f(arena.highestpos)} Best Pos` : "Hráč nehrál 2v2";
                mcMessage = `${header} ${rankedMsg}`;
            }

            // DC Embed (Vždy ukáže vše)
            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Arena Brawl - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Stats", value: `Wins: \`${uhg.f(overall.wins)}\`\nKills: \`${uhg.f(overall.kills)}\`\nWLR: \`${overall.wlr}\``, inline: true },
                    { name: "Skills", value: `Offensive: ${arena.offensive}\nUtility: ${arena.utility}\nSupport: ${arena.support}\nUltimate: ${arena.ultimate}`, inline: true },
                    { name: "Ranked", value: `Rating: Chybí funkce :/\nBest Rating: ${uhg.f(arena.highestrt)}\nBest Pos: #${uhg.f(arena.highestpos)}`, inline: false }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Arena: `.red, e);
            return "Chyba při načítání Arena Brawl statistik.";
        }
    }
};
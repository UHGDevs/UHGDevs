module.exports = {
    name: "Fact",
    aliases: ["fact", "facts", "hypixelfact", "hypixelfacts", "funfact", "funfacts", "fakt", "fakty"],
    run: async (uhg, pmsg) => {
        try {
            const args = pmsg.args.split(" ");
            
            // Funkce pro získání dynamických faktů
            const getDynamicFact = async (id) => {
                let api;
                switch (id) {
                    case "2":
                        api = await uhg.api.call(pmsg.username, ["online"]);
                        if (!api.success) return "Chyba API";
                        return api.online.online && api.online.game 
                            ? `Vypadá to, že momentálně hraješ ${api.online.game} (${api.online.mode})` 
                            : "Vypadá to, že momentálně hraješ.. nebo spíš nehraješ?";
                    case "3":
                        api = await uhg.api.call("Technoblade", ["gamecounts"]); // Dummy call pro gamecounts
                        if (!api.gamecounts) return "Chyba API";
                        const limbo = (api.gamecounts.games.limbo || 0) + (api.gamecounts.games.idle || 0);
                        return `Momentálně se v Limbu nachází ${uhg.f(limbo)} hráčů.`;
                    case "4":
                        api = await uhg.api.call("Technoblade", ["gamecounts"]);
                        if (!api.gamecounts) return "Chyba API";
                        return `Momentálně na serveru hraje ${uhg.f(api.gamecounts.playerCount)} hráčů.`;
                    case "9":
                        const simps = ["zmikisek", "unisdynasty", "honzu", "0hblood"];
                        return simps.includes(pmsg.username.toLowerCase()) 
                            ? "SIMP CHECK >>>>> PROCESSING RESULTS -+-+- RESULTS: POSITIVE" 
                            : "SIMP CHECK >>>>> PROCESSING RESULTS -+-+- RESULTS: NEGATIVE";
                    case "10":
                        api = await uhg.api.call("Technoblade", ["gamecounts"]);
                        return `Momentálně ${uhg.f(api.gamecounts?.games?.skyblock?.crimson_isle || 0)} hráčů hraje na Crimson Isle.`;
                    case "11":
                        api = await uhg.api.call("Technoblade", ["gamecounts"]);
                        return `Momentálně ${uhg.f(api.gamecounts?.games?.skyblock?.dungeons || 0)} hráčů throwuje v Dungeonech.`;
                    case "12":
                        api = await uhg.api.call("Technoblade", ["gamecounts"]);
                        return `Tipněte si kolik lidí je momentálně v Crystal Hollows.... přesně ${uhg.f(api.gamecounts?.games?.skyblock?.hollows || 0)}.`;
                    default:
                        return null;
                }
            };

            const facts = [
                `Označili byste fakt č. 0 jako nultý fakt nebo první fakt?`,
                `Vývojáři tohoto bota jsou DavidCzPdy a Farmans.. Můžete hádat, kdo z nich dělal tento zbytečný příkaz`,
                "DYNAMIC", // 2
                "DYNAMIC", // 3
                "DYNAMIC", // 4
                `Víte, že MVP++ má na lobby Speed II, ale ostatní ranky mají jen Speed I? P2W server, confirmed`,
                `Momentálně na Hypixelu je přes 50 možných her, dokážeš je všechny vymasterovat?`,
                `Víte, že na SkyBlocku existuje takový Cookie Clicker? Najdete ho v Booster Cookie menu`,
                `Víte, že když si změníte jazyk na serveru, tak se vám změní nápisy psanými bloky? Například LEAD a INFO na různých lobby`,
                "DYNAMIC", // 9
                "DYNAMIC", // 10
                "DYNAMIC", // 11
                "DYNAMIC", // 12
                `Ona existuje zkratka pro /g onlinemode, a to je /g om..`,
                `Víte, že UHG byla založena dvakrát? Poprvé vydržela necelý den, když uni odešel do TKJK a napodruhé je ta, jak ji již známe dnes`,
                `Zkus napsat paragraf do chatu, haha nejde to co?`
            ];

            let index;
            let factText;

            // Uživatel zadal číslo
            if (args[0] && !isNaN(args[0])) {
                index = parseInt(args[0]);
                if (index < 0 || index >= facts.length) {
                    return `Fact #${index} - To má být pokus o vtip? Celkem neúspěšný. (Max: ${facts.length - 1})`;
                }
            } else {
                // Náhodný fakt
                index = Math.floor(Math.random() * facts.length);
            }

            // Získání textu (statický nebo dynamický)
            if (facts[index] === "DYNAMIC") {
                factText = await getDynamicFact(String(index));
            } else {
                factText = facts[index];
            }

            const message = `Fact #${index} - ${factText}`;
            
            // Pro Discord jen jednoduchý embed
            const dcEmbed = new uhg.dc.Embed()
                .setTitle(`Hypixel Fact #${index}`)
                .setColor(0x55FFFF)
                .setDescription(factText);

            return { mc: message, dc: dcEmbed };

        } catch (e) {
            console.error(` [ERROR] MC Command Fact: `.red, e);
            return "Chyba při hledání faktu.";
        }
    }
};
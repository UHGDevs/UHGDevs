module.exports = {
    name: "ClearCache",
    aliases: ["clearcache", "flush"],
    run: async (uhg, pmsg) => {
        try {
            const authorized = ["Farmans", "DavidCzPdy"]; // Seznam adminů
            const args = pmsg.args.split(" ");
            let targetName = pmsg.username;
            let isSelf = true;

            // Pokud je zadán argument a uživatel je admin, změníme cíl
            if (args[0] && args[0].trim() !== "") {
                if (authorized.includes(pmsg.username)) {
                    targetName = args[0];
                    isSelf = false;
                } else {
                    return "Nemáš oprávnění mazat cache jiných hráčů.";
                }
            }

            // Získáme UUID přes Mojang (nepoužíváme cache pro tento call, abychom měli jistotu)
            // Ale voláme jen identitu, což je rychlé
            const api = await uhg.api.getMojang(targetName);
            if (!api.success) return `Hráč ${targetName} nenalezen.`;

            const uuid = api.uuid;
            const typesToDelete = ["hypixel", "skyblock", "guild", "online"];
            let deletedCount = 0;

            for (const type of typesToDelete) {
                const key = `${type}_${uuid}`;
                // Metoda del v node-cache vrací počet smazaných (1 nebo 0)
                deletedCount += uhg.api.cache.del(key);
            }

            if (isSelf) {
                return `Tvá API cache (${deletedCount} záznamů) byla vymazána. Další příkaz načte čerstvá data.`;
            } else {
                return `Cache hráče ${api.username} (${deletedCount} záznamů) byla vymazána.`;
            }

        } catch (e) {
            console.error(e);
            return "Chyba při mazání cache.";
        }
    }
}
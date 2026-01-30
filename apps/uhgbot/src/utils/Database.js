/**
 * src/utils/Database.js
 * Hlavní správce MongoDB pro UHG Bota.
 * 
 * ARCHITEKTURA:
 * - Databáze: "data"
 * - Kolekce "users": Sjednocená data hráčů (UUID, Username, DiscordID, Stats, SkyBlock).
 * - Kolekce "guilds": Data o guildách (členové, historie GEXP).
 * 
 * CACHING:
 * - Používá node-cache pro minimalizaci dotazů do databáze.
 */

const { MongoClient } = require("mongodb");
const NodeCache = require("node-cache");

class Database {
    constructor(uhg) {
        this.uhg = uhg;
        this.mongo = null;
        this.db = null;

        // Nastavení Cache
        this.cache = {
            // Cache pro uživatele (Stats i Verify) - držíme 5 minut, kontrola každou minutu
            users: new NodeCache({ stdTTL: 300, checkperiod: 60 }),
            
            // Cache pro guildy - držíme 30 minut (mění se málo)
            guilds: new NodeCache({ stdTTL: 1800, checkperiod: 300 })
        };
    }

    /**
     * Připojení k MongoDB
     */
    async connect() {
        if (!process.env.db) {
            console.log(" [DB] CRITICAL: Chybí 'db' string v .env souboru!".red);
            return;
        }
        try {
            this.mongo = new MongoClient(process.env.db);
            await this.mongo.connect();
            
            // Explicitní výběr databáze "data"
            this.db = this.mongo.db("data");
            console.log(` [DB] Připojeno k databázi: ${this.db.databaseName}`.green);
        } catch (e) {
            console.error(" [DB ERROR] Připojení selhalo: ".bgRed, e);
        }
    }

    /* ==========================================================================
       GENERICKÉ METODY (Wrappery pro MongoDB driver)
       ========================================================================== */

    async findOne(collection, query, projection = {}) {
        if (!this.db) return null;
        return await this.db.collection(collection).findOne(query, { projection });
    }

    async find(collection, query = {}, projection = {}, limit = 0) {
        if (!this.db) return [];
        let cursor = this.db.collection(collection).find(query, { projection });
        if (limit > 0) cursor = cursor.limit(limit);
        return await cursor.toArray();
    }

    async updateOne(collection, query, data, upsert = true) {
        if (!this.db) return;
        return await this.db.collection(collection).updateOne(query, { $set: data }, { upsert });
    }

    async deleteOne(collection, query) {
        if (!this.db) return;
        return await this.db.collection(collection).deleteOne(query);
    }

    /* ==========================================================================
       SPRÁVA UŽIVATELŮ (Kolekce "users")
       Zahrnuje: Verifikace, Statistiky, Nastavení
       ========================================================================== */

    /**
     * Univerzální metoda pro získání uživatele.
     * Hledá podle: UUID, Discord ID nebo Username (case-insensitive).
     * 
     * @param {string} id - Identifikátor uživatele
     * @returns {Object|null} Dokument uživatele nebo null
     */
    async getUser(id) {
        if (!id) return null;
        const key = String(id).toLowerCase();

        // 1. Kontrola Cache
        if (this.cache.users.has(key)) {
            return this.cache.users.get(key);
        }

        // 2. Dotaz do Databáze
        // $or umožňuje hledat v jednom dotazu podle různých polí
        const data = await this.findOne("users", {
            $or: [
                { _id: id },                 // UUID (primární klíč)
                { discordId: id },           // Discord ID (pokud je verifikovaný)
                { username: { $regex: new RegExp(`^${id}$`, 'i') } } // Jméno (ignoruje velikost písmen)
            ]
        });

        // 3. Uložení do Cache (pod všemi známými klíči pro rychlejší přístup příště)
        if (data) {
            this.cache.users.set(String(data._id).toLowerCase(), data); // UUID
            if (data.discordId) this.cache.users.set(String(data.discordId).toLowerCase(), data);
            if (data.username) this.cache.users.set(String(data.username).toLowerCase(), data);
        }

        return data;
    }

    /**
     * Uloží nebo aktualizuje data uživatele (Stats, SkyBlock, atd.)
     * Používá $set, takže nepřepíše existující pole (např. discordId), pokud nejsou v 'data'.
     * 
     * @param {string} uuid - UUID hráče (Primární klíč)
     * @param {Object} data - Objekt s daty k uložení
     */
    async saveUser(uuid, data) {
        if (!this.db) return;
        
        // Přidáme timestamp aktualizace
        const payload = { ...data, updated: Date.now() };

        try {
            await this.updateOne("users", { _id: uuid }, payload);
            
            // Aktualizace cache: Pro jednoduchost smažeme starý záznam,
            // aby si příští getUser natáhl čerstvá kompletní data z DB.
            // (Přepisování cache je riskantní, pokud 'data' neobsahuje celý objekt)
            this.cache.users.del(uuid);
        } catch (e) {
            console.error(` [DB ERROR] saveUser: ${e.message}`.red);
        }
    }

    /**
     * Provede hromadné operace (Bulk Write) nad kolekcí users.
     * @param {Array} operations - Pole operací (updateOne, insertOne...)
     */
    async bulkUpdateUsers(operations) {
        if (!this.db || !operations.length) return;
        try {
            // "users" je naše hlavní kolekce
            return await this.db.collection("users").bulkWrite(operations);
        } catch (e) {
            console.error(` [DB ERROR] Bulk update failed: ${e.message}`.red);
        }
    }

    /**
     * UNVERIFY: Odstraní propojení Discordu, ale ZACHOVÁ statistiky.
     * 
     * @param {string} discordId - ID uživatele na Discordu
     */
    async deleteVerify(discordId) {
        const user = await this.getUser(discordId);
        if (!user) return false;

        try {
            // Použijeme $unset pro odstranění konkrétního pole
            await this.db.collection("users").updateOne(
                { _id: user._id },
                { $unset: { discordId: "" } }
            );

            // Invalidace cache pro všechny klíče tohoto uživatele
            const keys = [user._id, user.discordId, user.username];
            keys.forEach(k => { if (k) this.cache.users.del(String(k).toLowerCase()); });

            return user;
        } catch (e) {
            console.error(` [DB ERROR] deleteVerify: ${e.message}`.red);
            return false;
        }
    }

    /**
     * Získá statistiky hráče (bez SkyBlock data a dalších zbytečností).
     * Optimalizováno pomocí Mongo Projection.
     * * @param {string} id - UUID, Discord ID nebo Username
     */
    async getStats(id) {
        if (!id) return null;
        const key = String(id).toLowerCase();

        // 1. Kontrola Cache (Pokud máme kompletní data, použijeme je)
        if (this.cache.users.has(key)) {
            return this.cache.users.get(key);
        }

        // 2. Sestavení dotazu (stejné jako u getUser)
        const query = {
            $or: [
                { _id: id },
                { discordId: id },
                { username: { $regex: new RegExp(`^${id}$`, 'i') } }
            ]
        };

        // 3. Projection: Vybereme jen to, co potřebujeme
        const projection = {
            _id: 1,      // UUID (primární klíč)
            uuid: 1,     // Explicitní UUID pole (pokud existuje)
            username: 1, // Jméno
            stats: 1,    // Statistiky z Hypixelu
        };

        const data = await this.findOne("users", query, projection);

        if (!data) return null;

        // Pokud v DB chybí pole 'uuid' (protože je v _id), doplníme ho pro kompatibilitu
        if (!data.uuid) data.uuid = data._id;

        // 4. NEUKLÁDÁME do this.cache.users!
        // Uložení částečných dat by rozbilo logiku metody getUser (která spoléhá na to, že v cache je vše).
        
        return data;
    }

    /**
     * VERIFIKACE: Propojí Discord ID s Minecraft účtem v kolekci 'users'.
     */
    async updateVerify(discordId, data) {
        if (!this.db || !data.uuid) return false;

        const payload = {
            discordId: discordId,
            username: data.username,
            updated: Date.now()
        };

        try {
            await this.db.collection("users").updateOne(
                { _id: data.uuid },
                { $set: payload },
                { upsert: true }
            );
            this.cache.users.del(data.uuid);
            return true;
        } catch (e) {
            console.error(` [DB ERROR] updateVerify: ${e.message}`.red);
            return false;
        }
    }

    // Získání verify dat s optimalizací (Mongo Projection)
    async getVerify(id) {
        if (!id) return null;
        const key = String(id).toLowerCase();

        // 1. Rychlá kontrola: Pokud už máme plná data v cache, použijeme je.
        // Ušetříme tím jakýkoliv dotaz do DB.
        if (this.cache.users.has(key)) {
            const user = this.cache.users.get(key);
            if (!user.discordId) return null;
            return {
                _id: user.discordId,
                uuid: user._id,
                nickname: user.username,
                username: user.username
            };
        }

        // 2. Pokud není v cache, uděláme LEHKÝ dotaz do DB.
        // Místo stahování celého objektu (Stats, SkyBlock...) stáhneme jen identifikační údaje.
        const query = {
            $or: [
                { _id: id },                                           // UUID
                { discordId: id },                                     // Discord ID
                { username: { $regex: new RegExp(`^${id}$`, 'i') } }   // Username
            ]
        };

        // Projection: Specifikujeme, že chceme vrátit pouze tato pole
        const projection = { 
            _id: 1, 
            username: 1, 
            discordId: 1 
        };

        const user = await this.findOne("users", query, projection);

        if (!user || !user.discordId) return null;

        // DŮLEŽITÉ: Výsledek z projection NEUKLÁDÁME do this.cache.users,
        // protože cache očekává kompletní data. Uložení částečných dat by rozbilo `getUser`.

        return {
            _id: user.discordId,
            uuid: user._id,
            nickname: user.username,
            username: user.username
        };
    }

    /**
     * Získá seznam všech aktivních členů konkrétní guildy pomocí projekce.
     * @param {string} guildName - Název guildy (např. UltimateHypixelGuild)
     */
    async getOnlineMembers(guildName = "UltimateHypixelGuild") {
        try {
            // Hledáme lidi, kteří mají v poli guilds záznam s tímto jménem a active: true
            const members = await this.db.collection("users").find(
                { "guilds": { $elemMatch: { name: { $regex: new RegExp(`^${guildName}$`, 'i') }, active: true } } },
                { 
                    projection: { 
                        username: 1, 
                        discordId: 1,
                        // Vrátíme jen ten jeden konkrétní prvek pole guilds, který odpovídá jménu
                        guilds: { $elemMatch: { name: guildName } } 
                    } 
                }
            ).toArray();

            // Převedeme to na plochý formát, aby se s tím lépe pracovalo (jako dřív v getGuild)
            return members.map(m => ({
                uuid: m._id,
                username: m.username,
                discordId: m.discordId,
                rank: m.guilds[0].rank,
                joined: m.guilds[0].joined
            }));
        } catch (e) {
            console.error(` [DB ERROR] getOnlineMembers: ${e.message}`.red);
            return [];
        }
    }

    /**
     * Aktualizuje GEXP uživatele v konkrétní guildě.
     * Pokud záznam pro guildu neexistuje, vytvoří ho.
     */
    async updateUserGexp(uuid, guildName, date, amount, currentRank) {
        if (!this.db) return;

        // 1. Nejdřív zkusíme aktualizovat existující záznam v poli
        const res = await this.db.collection("users").updateOne(
            { _id: uuid, "guilds.name": guildName },
            { 
                $set: { 
                    "guilds.$[elem].active": true,
                    "guilds.$[elem].rank": currentRank,
                    "guilds.$[elem].left": null,
                    [`guilds.$[elem].exp.${date}`]: amount
                } 
            },
            { 
                arrayFilters: [{ "elem.name": guildName }],
                upsert: false 
            }
        );

        // 2. Pokud se nic nezměnilo (res.matchedCount === 0), guilda v poli chybí -> Přidáme ji
        if (res.matchedCount === 0) {
            await this.db.collection("users").updateOne(
                { _id: uuid },
                { 
                    $push: { 
                        guilds: {
                            name: guildName,
                            active: true,
                            joined: Date.now(),
                            left: null,
                            rank: currentRank,
                            exp: { [date]: amount }
                        }
                    }
                },
                { upsert: true }
            );
        }
    }
}

module.exports = Database;
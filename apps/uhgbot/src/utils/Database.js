/**
 * src/classes/Database.js
 * Správa připojení k MongoDB a cachování dat.
 */
const { MongoClient } = require("mongodb");
const NodeCache = require("node-cache");

class Database {
    constructor(uhg) {
        this.uhg = uhg;
        // Kontrola, zda je nastaveno připojení
        if (!process.env.db) {
            console.log(" [DB] Chybí DB string v .env! Databáze nebude fungovat.".red);
            this.mongo = null;
        } else {
            this.mongo = new MongoClient(process.env.db);
            this.connect();
        }
        
        // Cache pro úsporu RAM a DB requestů
        this.cache = {
            verify: new NodeCache({ stdTTL: 600, checkperiod: 120 }), // 10 min
            stats: new NodeCache({ stdTTL: 300, checkperiod: 60 }),   // 5 min
            guild: new NodeCache({ stdTTL: 3600, checkperiod: 600 })  // 1 hodina
        };
    }

    async connect() {
        try {
            await this.mongo.connect();
            console.log(" [DB] MongoDB připojeno.".green);
        } catch (e) { console.error(" [DB ERROR] ".bgRed, e); }
    }

    /**
     * Získá verifikaci uživatele (Discord ID, UUID nebo Nick)
     */
    async getVerify(id) {
        if (!this.mongo || !id) return null;
        
        const cacheKey = String(id).toLowerCase();
        let cached = this.cache.verify.get(cacheKey);
        if (cached) return cached;

        try {
            const db = this.mongo.db("general");
            const col = db.collection("verify");

            let data = await col.findOne({ 
                $or: [
                    { _id: id },
                    { uuid: id },
                    { nickname: { $regex: new RegExp(`^${id}$`, 'i') } },
                    { name: { $regex: new RegExp(`^${id}$`, 'i') } }
                ]
            });

            if (data) {
                // Uložíme do cache pod všemi identifikátory
                this.cache.verify.set(String(data._id).toLowerCase(), data);
                this.cache.verify.set(String(data.uuid).toLowerCase(), data);
                if (data.nickname) this.cache.verify.set(String(data.nickname).toLowerCase(), data);
                return data;
            }
        } catch (e) {
            console.error(` [DB ERROR] getVerify: ${e.message}`.red);
        }
        return null;
    }

    /**
     * Získá statistiky hráče (Zde byla chyba - tato metoda chyběla)
     */
    async getStats(uuid) {
        if (!this.mongo || !uuid) return null;
        
        let cached = this.cache.stats.get(uuid);
        if (cached) return cached;

        try {
            const db = this.mongo.db("stats");
            let data = await db.collection("stats").findOne({ uuid: uuid });
            
            if (data) {
                this.cache.stats.set(uuid, data);
                return data;
            }
        } catch (e) {
            console.error(` [DB ERROR] getStats: ${e.message}`.red);
        }
        return null;
    }

    /**
     * Uloží/Aktualizuje statistiky hráče
     */
    async saveStats(uuid, data) {
        if (!this.mongo) return;
        try {
            await this.mongo.db("stats").collection("stats").updateOne({ uuid }, { $set: data }, { upsert: true });
            this.cache.stats.set(uuid, data);
        } catch (e) { console.error(e); }
    }

    /**
     * Uloží/Aktualizuje verifikaci
     */
    async updateVerify(id, data) {
        if (!this.mongo) return false;
        try {
            const db = this.mongo.db("general");
            await db.collection("verify").updateOne({ _id: id }, { $set: data }, { upsert: true });

            // Aktualizace cache
            this.cache.verify.set(String(id).toLowerCase(), data);
            if (data.uuid) this.cache.verify.set(String(data.uuid).toLowerCase(), data);
            if (data.nickname) this.cache.verify.set(String(data.nickname).toLowerCase(), data);

            return true;
        } catch (e) {
            console.error(` [DB ERROR] updateVerify: ${e.message}`.red);
            return false;
        }
    }

    /**
     * Smaže verifikaci (DB + Cache)
     */
    async deleteVerify(id) {
        if (!this.mongo) return false;
        
        const data = await this.getVerify(id);
        if (!data) return false;

        try {
            await this.mongo.db("general").collection("verify").deleteOne({ _id: data._id });

            const keysToDelete = [
                data._id, data.uuid, data.nickname,
                String(data._id).toLowerCase(),
                String(data.uuid).toLowerCase(),
                String(data.nickname || "").toLowerCase()
            ];
            
            keysToDelete.forEach(k => this.cache.verify.del(k));
            return data;
        } catch (e) {
            console.error(` [DB ERROR] deleteVerify: ${e.message}`.red);
            return false;
        }
    }

    /**
     * Legacy wrapper pro staré commandy
     */
    get run() {
        return {
            get: async (db, col, q) => this.mongo.db(db).collection(col).find(q).toArray(),
            post: async (db, col, data) => this.mongo.db(db).collection(col).insertOne(data),
            update: async (db, col, q, d) => this.mongo.db(db).collection(col).updateOne(q, { $set: d }, { upsert: true }),
            delete: async (db, col, q) => this.mongo.db(db).collection(col).deleteOne(q)
        };
    }
}

module.exports = Database;
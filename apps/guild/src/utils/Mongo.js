
const mongodb = require('mongodb');
const redisdb = require('redis');
const Config = require('./Config');

class Mongo extends Config {
    constructor() {
      super()
    }

    async createMongo() {
        let options = {}
        let mongo = await mongodb.MongoClient.connect(process.env.db, options)

        let connected = await this.connectRedis()
        if (!connected) console.error('Redis db není zaplá!')
        setInterval(this.connectRedis.bind(this), 60000);
      

        this.mongo = mongo

        console.mongo('Database connections opened successfully');
    }

    async get(db, col, query={}) {
      try {
        const collection = this.mongo.db(db).collection(col);
        return await collection.find(query).toArray()
      } catch (e) {
        console.mongo(e, {error: true})
      }
    }

    async post(db, col, query, upsert=true) {
      let q = query._id ? {_id: query._id} : (query.uuid ? { uuid: query.uuid} : (query.name ? query.name : null))
      if (!q) { console.error('Mongo db nenašlo _id|uuid|name'); return false }
      try {
        const collection = this.mongo.db(db).collection(col);
        return await collection.updateOne(q, { $set: query }, { upsert: upsert })
      } catch (e) {
        console.mongo(e, {error: true})
      }
    }

    async delete(db, col, query) {
      try {
        const collection = this.mongo.db(db).collection(col);
        return await collection.deleteOne(query)
      } catch (e) {
        console.mongo('QUERY na odstraneni nebylo nalezeno')
        return false
      }
    }

    async redis_get(keys, path = '.') {
      if (!this.redis) return false
      let errors = []
      if (typeof keys === 'string') keys = [keys]
      let stats = await Promise.all(keys.map(async (key) => [key, await this.redis.json.get(key, { path: path}).catch(e => { errors.push(key)}) ]))//.catch(e => { errors.push(key)})

      return { data: stats.filter(n => n !== undefined), errors: errors}
    }

    async redis_post(key, data, path = '.') {
      if (!this.redis) return false
      await uhg.redis.json.set(key, path, data)
      return true
    }

    async getRedisKeys() {
      if (!this.redis) return false
      let keys = await uhg.redis.keys('*')
      return keys
    }

    async connectRedis() {
      if (this.redis) return
      try {
        this.redis = redisdb.createClient({
          socket: {
              host: "127.0.0.1",
              port: 6379
          },
          password: 'UHGDevs'
        });

        await this.redis.connect()
        this.redis.once('error', () => {
          console.error('Redis DB error')
          this.redis = undefined
        });
        return true
      } catch(e) {this.redis = undefined}
    }

  }
  
  module.exports = Mongo
  
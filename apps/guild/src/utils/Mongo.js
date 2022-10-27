
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

        try {
          this.redis = redisdb.createClient({
            socket: {
                //host: process.env.redis,
                //port: 14305
                host: "127.0.0.1",
                port: 6379
            },
            password: 'UHGDevs'
          });

          await this.redis.connect()
          this.redis.on('error', err => console.log('Error ' + err));
        } catch(e) {
          this.redis = undefined
          console.error('REDIS db není zaplá')
        }
      

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
      let stats = await Promise.all(keys.map(async (key) => await this.redis.json.get(key, { path: path}).catch(e => { errors.push(key)})))

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

  }
  
  module.exports = Mongo
  
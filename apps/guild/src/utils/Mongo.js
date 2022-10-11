
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
              //host: "redis",
              port: 6379
          },
          password: 'UHGDevs'
      });

      await this.redis.connect()
      

      this.redis.on('error', err => {
        console.log('Error ' + err);
    });
  } catch(e) {console.error('e')}
      

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

  }
  
  module.exports = Mongo
  
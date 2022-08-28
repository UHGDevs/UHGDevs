
const { Error } = require('../errors')
const { MongoClient } = require("mongodb");

const ApiKey = require('./ApiKey');

class MongoDB extends ApiKey {
  constructor(options) {
    super(options);

    if (this.options.db) {

      this.mongo = new MongoClient(this.options.db);
      this.mongo.connect()

      this.mongo.once('open', async () => {
        this.mRefresh()

        setInterval(this.mRefresh, 1700000);
      })
    } else this.mongo = {}
  }

  async mGet(db="stats", col="stats", query={}) {
    if (!this.mongo) return false
    try {
      const collection = this.mongo.db(db).collection(col);
      let result = await collection.find(query).toArray()
      return result
    } catch (e) {
      console.log(e)
    }
  }
  
  
  async mPost(db="stats", col="stats", query={}) {
    if (!this.mongo) return false
    try {
      if (!query) return false
      const collection = this.mongo.db(db).collection(col);
      return await collection.insertOne(query)
    } catch (e) {
      let id = { _id: query._id }
      if (!query._id) return "nic"
      delete query._id
      if (!query) return "nic"
      return await this.mUpdate(db, col, id, query)
    }
  }

  async mUpdate (db="stats", col="stats", query={}, novy={}, con=true) {
    if (!this.mongo) return false
    try {
      if (!novy||!query) return false
      let update = {$set:novy}
      const collection = this.mongo.db(db).collection(col);
      let result = await collection.updateOne(query, update, { upsert: con })
      return result
    } catch (e) {
      console.log(e)
    }
  }

  async mDelete(db="stats", col="stats", query={}) {
    if (!this.mongo) return false
    try {
      if (!query) return false
      const collection = this.mongo.db(db).collection(col);
      let result = await collection.deleteOne(query)
      return result
    } catch (e) {
      return "neni"
      console.log(e)
    }
  }

  async mRefresh() {
    let uhgdata = await this.mGet('data', 'users', {})
    this.uhgdata = uhgdata
  }


}

module.exports = MongoDB;

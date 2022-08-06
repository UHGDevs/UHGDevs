let mongo;
exports.setup = (mng) => {
  mongo = mng
}

exports.get = async function(db="stats", col="stats", query={}) {
  try {
    const database = mongo.db(db);
    const collection = database.collection(col);
    let result = await collection.find(query).toArray()
    return result
  } catch (e) {
    console.log(e)
  }
}



exports.post = post
async function post (db="stats", col="stats", query={}) {
  let result;
  try {
    if (!query) return false
    const database = mongo.db(db);
    const collection = database.collection(col);
    result = await collection.insertOne(query)
    return result
  } catch (e) {
    //console.log(e)
    id = { _id: query._id }
    if (!query._id) return "nic"
    delete query._id
    if (!query) return "nic"
    return await update (db, col, id, query)
  }
}

exports.update = update
async function update (db="stats", col="stats", query={}, novy={}, con=true) {
  try {
    if (!novy||!query) return false
    let update = {$set:novy}
    const database = mongo.db(db);
    const collection = database.collection(col);
    let result = await collection.updateOne(query, update)
    if (!result.matchedCount && con) result = await post(db, col, Object.assign({}, query, novy))
    return result
  } catch (e) {
    console.log(e)
  }
}

exports.get = async function(db="stats", col="stats", query={}) {
  if (!mongo.topology) await new Promise(res => setTimeout(res, 2000))
  try {
    const database = mongo.db(db);
    const collection = database.collection(col);
    let result = await collection.find(query).toArray()
    return result
  } catch (e) {
    console.log(e)
  }
}

exports.delete = async function(db="stats", col="stats", query={}) {
  try {
    if (!query) return false
    const database = mongo.db(db);
    const collection = database.collection(col);
    let result = await collection.deleteOne(query)
    return result
  } catch (e) {
    return "neni"
    console.log(e)
  }
}

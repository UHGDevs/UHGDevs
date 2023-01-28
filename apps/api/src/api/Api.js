
const CreateUser = require('../util/CreateUser')

class Api extends CreateUser {
  constructor(options) {
    super(options)

    this.send = this.getApi(options)
  }

  async getApi(options) {
    return new Promise(async resolve => {
    /* First time call */
    if (!this.username || !this.uuid || !this.names) {
      let launch = this.basic ? await this.basic : {success: false}
      if (!launch.success && Number(this.created) < Number(new Date()) - 10000) launch = await require(`./mojang`).call({ user: launch.input, client: options.client })
      if (!launch.success) return resolve(launch)

      this.username = launch.username
      this.uuid = launch.uuid
      this.names = launch.names
      this.textures = launch.textures

      this.date = new Date(launch.created_at)

      delete this.basic
    }

    const api = {success: true, username: this.username, uuid: this.uuid, names: this.names, textures: this.textures, date: this.date,  }
    
    options.client = this.client
    options.uuid = this.uuid
    options.user = this
    

    const calls = options.call.filter(n => n.toLowerCase() !== 'mojang' && n.toLowerCase() !== 'mjg' );

    let promises = []
    for (let call of calls) {
      /* require api from database (aliases) */
      let fetcher = this.client.calls.get(call.toLowerCase())
      if (!fetcher) return resolve ({ success: false, reason: `${call} is invalid name of api`})

      promises.push( require(`./${fetcher}`).call(options) );
    }

    promises = await Promise.all(promises);

    for (let result of promises) {
      if (result.success !== true) return resolve({ success: false, reason: result.reason || `Chyba v ${result.name} API`})
      delete result.success

      let type = result.type
      delete result.type
      api[type] = result

      this.cache[type] = result
    }
    resolve(api)
    });
  }
}

module.exports = Api;

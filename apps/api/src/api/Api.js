
const CreateUser = require('../util/CreateUser')

class Api extends CreateUser {
  constructor(options) {
    super(options)

    this.send = this.getApi(options)
  }

  async getApi(options) {
    return new Promise(async resolve => {

    /* First time call */
    if (!this.username) {
      let launch = this.basic ? await this.basic : {success: false}
      if (!launch.success) launch = await require(`./mojang`).call(options)
      if (!launch.success) return resolve(launch)

      this.username = launch.username
      this.uuid = launch.uuid

      delete this.basic
    }

    const api = {success: true, username: this.username, uuid: this.uuid}
    
    options.client = this.client
    options.uuid = this.uuid
    

    const calls = options.call.filter(n => n.toLowerCase() !== 'mojang' && n.toLowerCase() !== 'mjg' );

    let promises = []
    for (let call of calls) {
      /* require api from database (aliases) */
      let fetcher = this.client.calls.get(call.toLowerCase())
      if (!fetcher) return resolve ({ success: false, reason: `${call} is invalide name of api`})

      promises.push( require(`./${fetcher}`).call(options) );
    }

    promises = await Promise.all(promises);

    for (let result of promises) {
      if (result.success !== true) return resolve({ success: false, reason: result.reason || `Chyba v ${result.name} API`})
      delete result.success

      let type = result.type
      delete result.type
      api[type] = result
    }
    resolve(api)
    });
  }
}

module.exports = Api;

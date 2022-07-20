
const CreateUser = require('../util/CreateUser')

class Api extends CreateUser {
  constructor(options) {
    super(options)

    this.send = this.getApi(options)
  }

  async getApi(options) {
    return new Promise(async resolve => {

    let launch = await this.ready
    if (!launch.success) return resolve(launch)


    const api = {success: true, username: this.username||launch.username, uuid: this.uuid||launch.uuid}

    if (launch.type !== 'mojang') api[launch.type] = launch

    options.client = this.client
    options.uuid = api.uuid
    

    const calls = options.call.filter(n => n.toLowerCase() !== 'mojang');
    let promises = []
    for (let call of calls) {
      let fetcher = this.client.calls.get(call.toLowerCase())
      if (!fetcher) return resolve ({ success: false, reason: `${call} is invalide name of api`})

      promises.push( require(`./${call}`).call(options) );
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

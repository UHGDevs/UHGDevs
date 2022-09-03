
const Collection = require('@discordjs/collection').Collection

const { Error } = require('../errors')
const Nw = require('./Nw');
const Util = require('../util/Util');
const Options = require('../util/Options');

const Api = require('../api/Api');
const { getLegacy } = require('../util/achievements');

class Client extends Nw {
  constructor(options = {}) {
    super(options);

    this.version = '0.0.0';


    this.users = new Collection()
    this.aliases = new Collection()

    this.calls = new Collection()

    this.createCalls()
    this.cacheAps()
  }
  call(input, call = [], options = {}) {
    console.log('IN API')

    options.call = call

    if (typeof input !== 'string') throw new Error('INVALID_TYPE', 'username or uuid', 'string');
    if (typeof options !== 'object') throw new Error('INVALID_TYPE', 'options', 'object');
    if (typeof call !== 'object') throw new Error('INVALID_TYPE', 'api calls', 'object');

    options = Util.mergeSettings(Options.createCall(this), options);

    input = input.toLowerCase();
    let user = this.users.get(input) || this.users.get(this.aliases.get(input));
    options.client = this

    options.premium = options.premium ?? (options.verify ? this.uhgdata?.find(n => n.uuid == options.verify.uuid)?.premium ?? false : false)
    if (!user) {
      options.user = input

      user = new Api(options)

      delete options.user
      delete options.client

      return user.send
    } else {
      return user.getApi(options)
    }
  }

  createCalls() {
    this.calls.set('mojang', 'mojang')
    this.calls.set('mjg', 'mojang')

    this.calls.set('hypixel', 'hypixel')

    this.calls.set('guild', 'guild')

    this.calls.set('recent', 'recent')

    this.calls.set('online', 'online')
    this.calls.set('status', 'online')

    this.calls.set('counts', 'gamecounts')
    this.calls.set('gamecounts', 'gamecounts')

    this.calls.set('skyblock', 'skyblock')
    this.calls.set('sb', 'skyblock')

    this.calls.set('friends', 'friends')
    
  }

  async cacheAps() {
    let data = await this.callHypixel.get('resources/achievements').then( n => n.data )
    let aps = {
      all: data.achievements,
      legacy: await require('../util/achievements').getLegacy(data.achievements)
    }
    this.aps = aps
    return aps
  }

  setVerify(array) {
    this.data_verify = array
  }

}

module.exports = Client;

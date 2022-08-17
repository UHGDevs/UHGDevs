
const Collection = require('@discordjs/collection').Collection

const { Error } = require('../errors')
const ApiKey = require('./ApiKey');
const Util = require('../util/Util');
const Options = require('../util/Options');

const Api = require('../api/Api');
const { getLegacy } = require('../util/achievements');

class Client extends ApiKey {
  constructor(options = {}) {
    super(options);

    this.version = '0.0.0';


    this.users = new Collection()
    this.aliases = new Collection()

    this.calls = new Collection()

    this.createCalls()
    this.cacheAps()
  }
  call(input, opt = {}) {
    let options = opt;

    if (typeof input !== 'string') throw new Error('INVALID_TYPE', 'username or uuid', 'string');
    if (typeof options !== 'object') throw new Error('INVALID_TYPE', 'options', 'object');
    if (Array.isArray(options)) options = {call: options};

    options = Util.mergeSettings(Options.createCall(this), options);

    input = input.toLowerCase();
    let user = this.users.get(input) || this.users.get(this.aliases.get(input));
    if (!user) {
      options.user = input
      options.client = this

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

}

module.exports = Client;

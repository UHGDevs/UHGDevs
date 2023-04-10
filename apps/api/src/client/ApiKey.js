
const { Error } = require('../errors')
const EventEmitter = require('events');
const Util = require('../util/Util');
const Options = require('../util/Options');

const { create } = require('axios');
const https = require('https')
const httpsAgent = new https.Agent({ keepAlive: true });

class ApiKey extends EventEmitter {
  constructor(options) {
    super();
    this.options = Util.mergeSettings(Options.createDefault(), options);

    if (typeof this.options !== 'object' || this.options === null) throw new Error('INVALID_TYPE', 'options', 'object', true);
    if (!this.options.key.length) throw new Error('API_KEY_MISSING');
    if (typeof this.options.key !== 'string' && !(typeof this.options.key === 'object' && Array.isArray(this.options.key) && this.options.key.length)) throw new Error('INVALID_TYPE', 'API key', 'string or an array');

    if (typeof this.options.key === 'string') {
      this.options.key = [this.options.key]
      this.options.key_count = 1
    } else {
      this.options.key_count = this.options.key.length
      this.options.key = this.options.key.filter(key => typeof key === 'string')

      if (this.options.key.length !== this.options.key_count) throw new Error('API_KEY_COUNT', this.options.key_count, this.options.key.length);
    }

    this.callHypixel = create({ baseURL: 'https://api.hypixel.net/', httpsAgent })

    this.testKeys()
    this.resetKeyTimer()
  }

  async testKeys() {
    const keys = this.options.key
    this.options.key = []
    for (let key of keys) {
      try {
        const response = await this.callHypixel.get('key', {params: { key: key }}).then( n => n.data )
        if (!response.success) throw new Error('API_KEY_INVALIDE', `(${key})`);
        else this.options.key.push(key);
      } catch (e) { console.info("Invalid authorization of API key (Hypixel API is having hard time)")}
    }
    if (!this.options.key.length) throw new Error('API_KEY_NOT_WORKING');
    this.options.key_count = this.options.key.length
    this.options.limit = this.options.key_count * 60 - 2
  }

  getKey() {
    this.options.use_key += 1;
    this.options.key_uses += 1;
    if (this.options.use_key >= this.options.key_count) this.options.use_key = 0;
    return this.options.key[this.options.use_key];
  }

  ratelimit() {
    return this.options.limit - this.options.key_uses
  }
  
  async resetKeyTimer() {
    while (true) {
      await this.delay(60000 - (new Date().getTime() % 60000))
      //this.options.limit = this.options.key_count * 120
      this.options.key_uses = 0;
    }
  }

  delay(ms) {return new Promise(res => setTimeout(res, ms))}

}

module.exports = ApiKey;


class Options {

  static createDefault() {
    return {
      key: [],
      key_count: 0,
      use_key: 0,
      key_uses: 0,
      limit: 0,
      guildBot: false,
      currentTourney: null,
      db: null
    };
  }

  static createCall(client) {
    return {
      call: ['hypixel'],
      limit: client.options.limit,
      key_count: client.options.key_count,
      key: client.options.key
    }
  }
}

module.exports = Options;

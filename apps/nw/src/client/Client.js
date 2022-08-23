
const Collection = require('@discordjs/collection').Collection
const Commands = require('./Commands');

class Client extends Commands {
  constructor(options = {}) {
    super(options);

    this.version = '0.0.0';
  }


}

module.exports = Client;

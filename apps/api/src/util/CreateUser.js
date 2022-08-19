
const Mojang = require('../api/mojang');
class CreateUser {
  constructor(options) {
    this.client = options.client
    this.cache = {}
    let user = Mojang.call(options)
    this.basic = user
    user.then(user => {
      this.success = user.success
      if (!user.success) this.reason = user.reason;
      else {
        this.client.users.set(user.username.toLowerCase(), this)
        this.client.aliases.set(user.uuid, user.username.toLowerCase())
      }
    })
  }


}

module.exports = CreateUser;

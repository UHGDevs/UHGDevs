
const Mojang = require('../api/mojang');
class CreateUser {
  constructor(options) {
    this.client = options.client
    this.cache = {}
    let user = Mojang.call(options)
    this.basic = user
    this.created = new Date()
    user.then(user => {
      this.success = user.success
      if (!user.success) {
        this.reason = user.reason;
        this.input = user.input
      } else {
        this.client.users.set(user.username.toLowerCase(), this)
        this.client.aliases.set(user.uuid, user.username.toLowerCase())
      }
    })
  }


}

module.exports = CreateUser;

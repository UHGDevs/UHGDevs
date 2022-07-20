
const Mojang = require('../api/mojang');
class CreateUser {
  constructor(options) {
    this.client = options.client
    let user = Mojang.call(options)
    this.ready = user
    user.then(user => {
      this.success = user.success
      if (!user.success) this.reason = user.reason
      else {
        this.username = user.username
        this.uuid = user.uuid
        if (!user.username) console.log(user)
        this.client.users.set(user.username.toLowerCase(), this)
        this.client.aliases.set(user.uuid, user.username.toLowerCase())
      }
    })
  }


}

module.exports = CreateUser;

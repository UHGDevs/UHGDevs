
const { Error } = require('../errors')
const fetch = require('node-fetch');

class Mojang {

  static async call(options) {
    const input = options.username || options.uuid || options.user
    let mojang;
    try {

      if (input.length > 16) {
        mojang = await fetch(`https://api.mojang.com/user/profiles/${input}/names`).then(mjg => mjg.json());

        if (mojang.error) return {success: false, reason: "Neplatné uuid", type: 'mojang'};

        mojang = mojang[mojang.length-1];
        return { success: true, username: mojang.name, uuid: input, type: 'mojang' };

      } else {
        mojang = await fetch(`https://api.mojang.com/users/profiles/minecraft/${input}`).then(mjg => mjg.json())

        return { success: true, username: mojang.name, uuid: mojang.id, type: 'mojang' };
      }

    } catch (e) { return {success: false, reason: "Neplatné minecraft jméno", type: 'mojang'} }
  }
}

module.exports = Mojang;


const client = require('../../../bot/src/utils/client');
const { Error } = require('../errors')

const axios = require('axios')

class Mojang {

  static async call(options) {
    const input = options.username || options.uuid || options.user
    let mojang;
    try {

      if (input.length > 16) {
        mojang = await axios.get(`https://api.mojang.com/user/profiles/${input}/names`).then(n => n.data );
        if (mojang.error) return {success: false, reason: "Neplatné uuid", type: 'mojang'};

        mojang = mojang[mojang.length-1];
        return { success: true, username: mojang.name, uuid: input, type: 'mojang' };

      } else {
        mojang = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${input}`).then(n => n.data );
        return mojang ? { success: true, username: mojang.name, uuid: mojang.id, type: 'mojang' } : {success: false, reason: 'Neplatné minecraft jméno', type: 'mojang'};
      }

    } catch (e) { return {success: false, reason: "Neplatné minecraft jméno", type: 'mojang'} }
  }
}

module.exports = Mojang;

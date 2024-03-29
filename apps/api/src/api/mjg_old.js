
const client = require('../../../bot/src/utils/client');
const { Error } = require('../errors')

const axios = require('axios')

class Mojang {

  static async call(options) {
    const client = options.client || {}
    const input = options.username || options.uuid || options.user
    if (!input) return {success: false, reason: 'Mojang API - není zadaný input', type: 'mojang'} 
    let call;
    try {

      if (input.length > 16) {
        call = await axios.get(`https://api.mojang.com/user/profiles/${input}/names`)
      } else {
        call = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${input}`)
      }

    } catch (e) { call = e.response }
    finally {
      if (!call) return {success: false, reason: 'Error ve volání MOJANGU', type: 'mojang', input: input} 
      if (!call.data) {
        if (typeof call.data === 'string' && options.premium) {
            let oldname = client.data_verify.find(n => { if (n.names && n.names.find(a => a.toLowerCase() == input.toLowerCase())) return true; return n.uuid.toLowerCase() == input.toLowerCase()})
            if (oldname || false) return { success: true, username: oldname.nickname, uuid: oldname.uuid, type: 'mojang' };
        }
        return {success: false, reason: input.length > 16 ? 'Neplatné UUID' : 'Neplatné jméno', type: 'mojang', input: input} 
      }
      if (call.data.error) return {success: false, reason: call.data.errorMessage, type: 'mojang', input: input}
      let mojang = call.data
      if (Array.isArray(mojang)) mojang = mojang[mojang.length-1];
      return { success: true, username: mojang.name, uuid: mojang.id || input, type: 'mojang' };
      
    }
  }     
}

module.exports = Mojang;

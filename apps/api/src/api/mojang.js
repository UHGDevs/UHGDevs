
const axios = require('axios')

class Mojang {

  static async call(options) {
    const client = options.client || {}
    const input = options.username || options.uuid || options.user
    if (!input) return {success: false, reason: 'Mojang API - není zadaný input', type: 'mojang'} 
    let call;
    try {
        call = await axios.get(`https://api.ashcon.app/mojang/v2/user/${input}`)
    } catch (e) { call = e.response }
    finally {
      if (!call) return {success: false, reason: 'Error ve volání MOJANGU', type: 'mojang', input: input} 
      if (!call.data || call.data.error) {
        if (options.premium) {
            let oldname = client.data_verify.find(n => { if (n.names && n.names.find(a => a.toLowerCase() == input.toLowerCase())) return true; return n.uuid.toLowerCase() == input.toLowerCase()})
            if (oldname) return { success: true, username: oldname.nickname, uuid: oldname.uuid, names: oldname.names, type: 'mojang', textures: oldname.textures, created_at: oldname.date };
        }
        return {success: false, reason: call.data?.reason|| (input.length > 16 ? 'Neplatné UUID' : 'Neplatné jméno'), type: 'mojang', input: input} 
      }
      let mojang = call.data
      if (mojang.username == 'Smolda') mojang.date = "2016-12-29"
      return { success: true, username: mojang.username, uuid: mojang.uuid.replace(/-/g, ''), names: mojang.username_history.map(n => n.username), textures: mojang.textures, created_at: mojang.created_at, type: 'mojang' };
      
    }
  }     
}

module.exports = Mojang;

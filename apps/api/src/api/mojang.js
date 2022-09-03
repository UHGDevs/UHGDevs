
const axios = require('axios')

class Mojang {

  static async call(options) {
    const client = options.client || {}
    const input = options.username || options.uuid || options.user
    if (!input) return {success: false, reason: 'Mojang API - není zadaný input', type: 'mojang'} 
    let call;
    try {
      console.time('Mojang FETCH')
        call = await axios.get(`https://api.ashcon.app/mojang/v2/user/${input}`)
        console.timeEnd('Mojang FETCH')
    } catch (e) { call = e.response }
    finally {
      if (!call) return {success: false, reason: 'Error ve volání MOJANGU', type: 'mojang', input: input} 
      if (!call.data) {
        if (typeof call.data === 'string' && options.premium) {
            let oldname = client.data_verify.find(n => { if (n.names && n.names.find(a => a.toLowerCase() == input.toLowerCase())) return true; return n.uuid.toLowerCase() == input.toLowerCase()})
            if (oldname || false) return { success: true, username: oldname.nickname, uuid: oldname.uuid, names: oldname.names, type: 'mojang', textures: oldname.textures, created_at: oldname.date };
        }
        return {success: false, reason: input.length > 16 ? 'Neplatné UUID' : 'Neplatné jméno', type: 'mojang', input: input} 
      }
      if (call.data.error) return {success: false, reason: call.data.reason, type: 'mojang', input: input}
      let mojang = call.data
      return { success: true, username: mojang.username, uuid: mojang.uuid.replace(/-/g, ''), names: mojang.username_history.map(n => n.username), textures: mojang.textures, created_at: mojang.created_at, type: 'mojang' };
      
    }
  }     
}

module.exports = Mojang;

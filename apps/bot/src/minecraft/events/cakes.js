let chat = require(`../send.js`)
let bridge = require(`../bridge.js`)
module.exports = async (uhg, pmsg) => {
    let data = pmsg.verify_data ? pmsg.verify_data.cakes || {} : {}
    if (!data || !data.toggle) return

    console.log(data)
    if (Number(new Date()) < data.expire); // cakes vyprseli
    if (Number(new Date()) + 1000000 < data.expire); // cakes vyprší za x času - čas nějak vymyslet
    let profile = data.profile;

    //  přidat if cakes vyprseli, popř. nějaký check api, ale ne pokaždé když se někdo připojí
    let api = await uhg.getApi(pmsg.username, ["api", "skyblock", "hypixel", "mojang"], ["main"])
    if (api instanceof Object == false) return api
    if (!api.skyblock.main[profile]) return uhg.dc.cache.channels.get('bot').send(`Cakes hráče ${pmsg.username}: ${profile} je neplatný profil`)

    let cakes = api.skyblock.main[profile].cakes
    console.log(cakes)

    // taky predelat
    if (!cakes) return chat.send(uhg, {send: `/msg ${pmsg.username} Došli ti cakes`})

    //uhg.mongo.run.update('general', 'uhg', { username: pmsg.username }, { cakes: {toggle: true, profile: profile, expire: expire.expire_at} })


    //return chat.send(uhg, {send: `/msg ${pmsg.username} Úspěch`})
}

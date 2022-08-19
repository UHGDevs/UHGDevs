
const func = require('../util/ApiFunctions');

class Skyblock {

  static async call(options) {
    const client = options.client;

    if (!options.uuid) return {success: false, type: "skyblock", reason: 'Skyblock API needs player UUID to be called!'};
    const uuid = options.uuid;

    const apikey = client.getKey()
    if (!apikey) return  {success: false, type: "skyblock", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "skyblock", reason: 'Hypixel API key limit reached!'};

    let skyblock;
    try { skyblock = await client.callHypixel.get('skyblock/profiles', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "skyblock", reason: 'Hypixel SkyBlock API is getting touble!'}};
    if (!skyblock.success) return  {success: false, type: "skyblock", reason: skyblock.cause};

    const profiles = skyblock.profiles.filter(n => !n.game_mode)

    const api = { success: true, type: 'skyblock', profiles: []}

    for (let p of profiles) {
      console.log(p.community_upgrades)

      /* -- Declare every profile basic info */
      let profile = {
        id: p.profile_id,
        name: p.cute_name,
        mode: func.sbMode(p.game_mode),

        bank: p.banking ? Math.floor(p.banking.balance) : -1,
        bank_history: [ ],
        bank_interest: { },

        upgrading: p.community_upgrades.currently_upgrading,
        upgrades: { }, // tiers + oznacit maxed (a asi napsat co to dělá do description)
        members: [ ]
      }
      /* - end - */


      /* -- If bank api is ON -- */
      if (p.banking) {
        p.banking.transactions.filter(n => n.initiator_name !== 'Bank Interest').forEach(e => {
          profile.bank_history.push({ coins: Number((e.action == 'DEPOSIT' ? '' : '-') + Math.floor(e.amount)), actor: func.clear(e.initiator_name), timestamp: e.timestamp })
        })

        profile.bank_interest.count = 0
        profile.bank_interest.money = 0

        p.banking.transactions.filter(n => n.initiator_name === 'Bank Interest').forEach(e => {
          profile.bank_interest.count += 1
          profile.bank_interest.money += Math.floor(e.amount)
        })
      }
      /* - end - */



      console.log(profile)
      api.profiles.push(profile)
    }
    

    return api
  }
}

module.exports = Skyblock;


/* ---- SCHEMA ---- */

/* -- profiles -- */
`                                                                : api off
profiles: array            - []
  id: string               - profile id
  name: string             - cutename
  mode: string             - normal|ironman|stranded|bingo

  bank: int                - island banking system               : -1
  bank_history: array      - bank transactions                   : []
  bank_interest: object    - maybe will be removed               : {}
    count: int                                                   : undefined
    money: int                                                   : undefined

  upgrading: object        - current community upgrade           : null
  upgrades: object         - comunity upgrades

  members: array           - all island members
`

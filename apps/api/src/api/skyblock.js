
const Api = require('./Api');
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
    try { skyblock = await client.callHypixel.get('skyblock/profiles', {params: { key: apikey, uuid: uuid }}).then( n => n.data ) } catch (e) {return {success: false, type: "skyblock", reason: e.response ? e.response.data.cause : 'Skyblock API error'}};
    if (!skyblock.success) return  {success: false, type: "skyblock", reason: skyblock.cause};
    if (!skyblock.profiles) return  {success: false, type: "skyblock", reason: 'Hráč nemá žádný profil!'};

    const profiles = skyblock.profiles

    const api = { success: true, type: 'skyblock', profiles: []}

    for (let p of profiles) {
      let community = p.community_upgrades || {}

      /* -- Declare every profile basic info */
      let profile = {
        id: p.profile_id,
        name: p.cute_name,
        mode: func.sbMode(p.game_mode),

        bank: p.banking ? Math.floor(p.banking.balance) : -1,
        bank_history: [ ],
        bank_interest: { },

        upgrading: func.comUpgrade(community.currently_upgrading),
        upgrades: [ ]
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


      /* -- Community Upgrades Formating-- */
      community.upgrade_states?.sort((a, b) => b.tier - a.tier).forEach(e => {
        if (profile.upgrades?.find(n => n.name == e.upgrade.replaceAll('_', ' '))) return
        profile.upgrades.push(func.comUpgrade(e))
      })      
      /* - end - */


      /* -- Member -- */ 
      let member = p.members[uuid]
      member.banking = p.banking
      member.experience_skill_social2 = Object.values(p.members).reduce((a, b)=>a += b.experience_skill_social2 || 0, 0)

      let cache = client.users.get(client.aliases.get(uuid))
      if (!cache || !cache.cache || !cache.cache.hypixel) {
        cache = new Api({user: uuid, call: ['hypixel'], client: client})
        let usr = await cache.send
        if (!usr.success) return { success: false, type: 'skyblock', reason: 'Fetching profile member error: ' + cache.reason + ' uuid: ' + uuid}
      }


      member.username = cache.username;
      member.uuid = cache.uuid;
      
      let player = require('./skyblock/player') (member, profile, cache)
      player.networth = await client.getNetworth(member)
      profile.member = player
      /* - end - */


      api.profiles.push(profile)
    }
    
    api.profiles.sort((a, b) => b.member.updated - a.member.updated)
    
    return api
  }
}

module.exports = Skyblock;


/* ---- SCHEMA ---- */

`
-- profiles --                                                    : api off

profiles: array             - []
  id: string                - profile id
  name: string              - cutename
  mode: string              - normal|ironman|stranded|bingo

  bank: int                 - island banking system               : -1
  bank_history: array       - bank transactions                   : []
  bank_interest: object     - maybe will be removed               : {}
    count: int                                                    : undefined
    money: int                                                    : undefined

  upgrading: object         - current community upgrade           : {}
  upgrades: array           - comunity upgrades

  member: object            - only CALLED MEMBER



 -- community upgrade -- 

  name: string                - formatted name
  tier: number                - if upgrading, the new one
  desc: string                - basic description


  -- island member -- 

  username: string
  uuid: string
  updated: int                - by hypixel
  joined: int                 - joined island time

  skills_api: bool            - true = on, false = off
  banking_api: bool
  purse_api: bool

  bank: object
    purse: int                                                     : 0
    bank: int                                                      : 0
    total: int

  fairy_souls: object
    total: int                - fairysouls found
    unclaimed: int            - unused fairysould
    boosted: int              - claimed fairysouls times (claimed/5)

  cakes: array                - copy of original

  skills: object
    social: object
    runecrafting: object
    carpentry: object
    taming: object
    alchemy: object
    enchanting: object
    fishing: object
    foraging: object
    combat: object
    mining: object
    farming: object
      exp: int                - all exp
      level: int              - skill level
      exp_current: int        - current exp in level
      missing_exp: int        - exp to next level
      progress: int           - % to next level
  skills_average: double_3
  skills_average_progress: double_3

  essence: object             - every hypixel essence
    undead: int
    wither: int
    spider: int
    ice: int
    gold: int
    diamond: int
    dragon: int
    crimson: int

  nw : object                 - from maro api


`
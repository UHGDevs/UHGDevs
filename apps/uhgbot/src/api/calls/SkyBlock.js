const axios = require('axios');
const path = require('path');

module.exports = {
    getProfiles: async (uhg, uuid, key, achievements = null) => {
        const res = await axios.get(`https://api.hypixel.net/v2/skyblock/profiles`, { params: { key, uuid } });
        if (!res.data.success) {
            throw new Error(res.data.cause || "Neznámá chyba Hypixel API");
        }
        if (!res.data.profiles || res.data.profiles.length === 0) {
            return { profiles: [] };
        }

        const profiles = [];
        const parserPath = path.resolve(__dirname, '../skyblock/player.js');
        const playerParser = require(parserPath);

        for (const p of res.data.profiles) {
            if (!p.members[uuid]) continue;
            p.uuid = uuid;

            profiles.push(playerParser(p, { achievements: achievements }))
        }

        profiles.sort((a, b) => (b.selected - a.selected) || (b.first_join - a.first_join));

        return { profiles };
    }
};

/* ---- SCHEMA ---- */

`
-- profiles --                                                    : api off

profiles: array             - []
  id: string                - profile id
  name: string              - cutename
  uuid: string              - uuid of member
  mode: string              - normal|ironman|stranded|bingo
  joined: int               - joined island time
  selected: bool            - is this profile selected

  apis: object
    purse: bool
    bank: bool
    skill: bool          - true = on, false = off
  
  bank: object
    purse: int                                                     : 0
    motes: int
    bank:  int                                                      : 0
    total: int
    networth: int             - currenty 0

  fairy_souls: object
    total: int                - fairysouls found
    unclaimed: int            - unused fairysould
    boosted: int              - claimed fairysouls times (claimed/5)

  cakes: array                - sorted cakes: expired, first to expire - last to expire

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

  collection: object

  essence: object             - every hypixel essence
    undead: int
    wither: int
    spider: int
    ice: int
    gold: int
    diamond: int
    dragon: int
    crimson: int
  
  mining: object
    powder: int
    powder_mithril: int
    powder_gemstone: int
    powder_glacite: int
    hotm_xp: int               - wrong
    hotm_tier: int             - wrong
    nucleus: int
    commissions: int
    scatha: int

  dungeons: object
    secrets: int
    currentClass: string
    lastRun: string
    level: int
    runs: int                  - completed runs
    secretsratio: int
    mobkills: int

    `
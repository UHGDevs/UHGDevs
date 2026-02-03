const axios = require('axios');
const path = require('path');
const { ProfileNetworthCalculator } = require('skyhelper-networth');
const func = require('../ApiFunctions');

module.exports = {
    getProfiles: async (uhg, uuid, key, options = {}) => {
        const res = await axios.get(`https://api.hypixel.net/v2/skyblock/profiles`, { params: { key, uuid } });
        if (!res.data.success) {
            throw new Error(res.data.cause || "Neznámá chyba Hypixel API");
        }
        if (!res.data.profiles || res.data.profiles.length === 0) {
            return { profiles: [] };
        }

        const profiles = [];
        const playerParser = require(path.resolve(__dirname, '../skyblock/player.js'));

        for (const p of res.data.profiles) {
          if (!p.members[uuid]) continue;
          p.uuid = uuid;

          const profile = playerParser(p, { achievements: options.achievements })

          if (options.networth && (p.selected || options.museumAll || options.profileName == profile.name)) {
            
            let museumData;
              try {
                const museumRes = await axios.get(`https://api.hypixel.net/v2/skyblock/museum`, { params: { key, profile: p.profile_id } });
                if (museumRes.data.members && museumRes.data.members[uuid]) {
                    museumData = museumRes.data.members[uuid];
                }
              } catch (e) {}

            const calculator = new ProfileNetworthCalculator(
              p.members[uuid],          // 1. Raw data hráče
              museumData,               // 2. Museum data
              p.banking?.balance || 0   // 3. Banka
            );
            const nwData = await calculator.getNetworth({
              prices: uhg.api.prices,
              onlyNetworth: false,
              returnItemData: false 
            });

            profile.bank.networth = nwData.networth;
            profile.networth = nwData;
            
          }

          if (options.garden && (p.selected || options.all || options.profileName == profile.name)) {
            const gardenRes = await axios.get(`https://api.hypixel.net/v2/skyblock/garden`, { params: { key, profile: p.profile_id } });
            if (!gardenRes.data.success) throw new Error(res.data.cause || "Neznámá chyba Garden API");
            let gardenData = gardenRes.data.garden || {};
            
            let gardenLevel = func.getGardenLevel(gardenData.garden_experience) 
            profile.garden.level = gardenLevel.level;
            profile.garden.levelInfinitive = gardenLevel.all;
            profile.garden.visitors = gardenData.commission_data?.total_completed || 0
            profile.garden.unique = gardenData.commission_data?.unique_npcs_served || 0
            profile.garden.composter = func.getComposter(gardenData.composter_data)
            profile.garden.composter.prices = {
              now: (uhg.api.prices['COMPOST'] || 0) * (profile.garden.composter?.compostWaiting || 0),
              later: (uhg.api.prices['COMPOST'] || 0) * (profile.garden.composter?.compostAtEnd || 0)
            }
          }

          profiles.push(profile)
        }

        profiles.sort((a, b) => {
            if (options.profileName) {
                // Pokud 'a' je hledaný profil, posuň ho nahoru (-1)
                if (a.name.toLowerCase() === options.profileName.toLowerCase()) return -1;
                // Pokud 'b' je hledaný profil, posuň ho nahoru (1, aby 'a' šlo dolů)
                if (b.name.toLowerCase() === options.profileName.toLowerCase()) return 1;
            }
            // 2. Priorita: Vybraný profil (Selected)
            // b.selected - a.selected (true je 1, false je 0)
            // Pokud b je selected (1) a a není (0) -> 1 - 0 = 1 (b jde dopředu) -> Správně
            if (a.selected !== b.selected) {
                return (b.selected || 0) - (a.selected || 0);
            }
            // 3. Priorita: Datum připojení (First Join) - od nejnovějšího
            return b.first_join - a.first_join;
        });

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
    bank:  int
    personal: int                                                      : 0
    total: int
    networth: int
  
  networth: object      - needs options

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
    mineshafts: int

  dungeons: object
    secrets: int
    currentClass: string
    lastRun: string
    level: int
    runs: int                  - completed runs
    secretsratio: int
    mobkills: int
    classes: object            - class level, formatted
      healer int
      mage: int
      berserk: int
      archer: int
      tank: int
    classavg: int

  crimson: object
    fraction: string
    rep: int
    dojo: int
    kuudras: int
    trophies: int

  end: object
    eyes: int
    eyes_placed: int
    drags: int
    soulflow: int

  garden: object           - needs options
    copper: int            - always
    level: double
    levelInfinitive: double
    visitors: int
    unique: int
    composter: object
  `
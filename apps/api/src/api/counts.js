
const func = require('../util/ApiFunctions');

class Counts {

  static async call(options) {
    const client = options.client;

    const apikey = client.getKey()
    if (!apikey) return  {success: false, type: "counts", reason: `Hypixel API key not found`};

    const limit = client.ratelimit();
    if (limit <= 0) return {success: false, type: "counts", reason: 'Hypixel API key limit reached!'};

    let counts;
    try { counts = await client.callHypixel.get('counts', {params: { key: apikey }}).then( n => n.data ) } catch (e) {return {success: false, type: "counts", reason: 'Hypixel GameCounts API is getting touble!'}};
    if (!counts.success) return  {success: false, type: "counts", reason: counts.cause};

    let gamecounts = counts.games
    const api = {
      success: true,
      type: 'counts',
      total: counts.playerCount,
      games: {
        mainlobby: gamecounts.MAIN_LOBBY.players || 0,
        tourneylobby: gamecounts.TOURNAMENT_LOBBY.players || 0,
        smp: gamecounts.SMP.players || 0,
        legacy: {
          players: gamecounts.LEGACY.players || 0,
          vampirez: gamecounts.LEGACY.modes.VAMPIREZ || 0,
          tkr: gamecounts.LEGACY.modes.GINGERBREAD || 0,
          arena: gamecounts.LEGACY.modes.ARENA || 0,
          quake: gamecounts.LEGACY.modes.QUAKECRAFT || 0,
          paintball: gamecounts.LEGACY.modes.PAINTBALL || 0,
          walls: gamecounts.LEGACY.modes.WALLS || 0,
        },
        supersmash: gamecounts.SUPER_SMASH.players || 0,
        duels: gamecounts.DUELS.players || 0,
        pit: gamecounts.PIT.players || 0,
        woolwars: gamecounts.WOOL_GAMES.players || 0,
        replay: gamecounts.REPLAY.players || 0,
        blitz: gamecounts.SURVIVAL_GAMES.players || 0,
        speeduhc: gamecounts.SPEED_UHC.players || 0,
        buildbattle: gamecounts.BUILD_BATTLE.players || 0,
        prototype: {
          players: gamecounts.PROTOTYPE.players || 0,
          pixelparty: gamecounts.PROTOTYPE.modes.PIXEL_PARTY || 0,
        },
        tntgames: gamecounts.TNTGAMES.players || 0,
        cac: gamecounts.MCGO.players || 0,
        housing: gamecounts.HOUSING.players || 0,
        bedwars: gamecounts.BEDWARS.players || 0,
        murder: gamecounts.MURDER_MYSTERY.players || 0,
        uhc: gamecounts.UHC.players || 0,
        mw: gamecounts.WALLS3.players || 0,
        arcade: gamecounts.ARCADE.players || 0,
        warlords: gamecounts.BATTLEGROUND.players || 0,
        queue: gamecounts.QUEUE.players || 0,
        limbo: gamecounts.LIMBO.players || 0,
        idle: gamecounts.IDLE.players || 0,
        skywars: {
          players: gamecounts.SKYWARS.players || 0,
          mega: gamecounts.SKYWARS.modes.mega_normal || 0,
        },
        skyblock: {
          players: gamecounts.SKYBLOCK.players || 0,
          crimson_isle: gamecounts.SKYBLOCK.modes.crimson_isle || 0,
          dungeons: gamecounts.SKYBLOCK.modes.dungeon || 0,
          hollows: gamecounts.SKYBLOCK.modes.crystal_hollows || 0,
        },
      },
      playerCount: counts.playerCount || 0, 
    }

    return api
  }
}

module.exports = Counts;

module.exports = {
    name: "Gamecount",
    aliases: ["gamecount", "gc", "game", "playercount", "pc", "players"],
    run: async (uhg, pmsg) => {
      try{
        let args = pmsg.args.split(" ")
        args = args[0].toLowerCase()
        let api = await uhg.getApi("fb811b92561e434eb5b6ef04695cc49a", ["gamecounts"])
        if (api instanceof Object == false) return api
        let gc = api.gamecounts.games
        let minigame;
        let players;
        if (!args) {minigame = "Hypixel Network"; players = api.gamecounts.playerCount}
        else if (args == "bedwars" || args == "bw" || args == "bed") {minigame = "Bed Wars"; players = gc.bedwars}
        else if (args == "skywars" || args == "sw") {minigame = "SkyWars"; players = gc.skywars.players}
        else if (args == "megasw" || args == "megaskywars" || args == "msw" || args == "swmega" || args == "mega") {minigame = "SkyWars Mega"; players = gc.skywars.mega}
        else if (args == "skyblock" || args == "sb") {minigame = "SkyBlock"; players = gc.skyblock.players}
        else if (args == "murder" || args == "mm" || args == "murdermystery") {minigame = "Murder Mystery"; players = gc.murder}
        else if (args == "legacy" || args == "classic" || args == "classicgames") {minigame = "Classic Games"; players = gc.legacy.players}
        else if (args == "arena" || args == "ab" || args == "arenabrawl" || args == "brawl") {minigame = "Arena Brawl"; players = gc.legacy.arena}
        else if (args == "vampirez" || args == "vampire" || args == "vampires" || args == "vz") {minigame = "VampireZ"; players = gc.legacy.vampirez}
        else if (args == "tkr" || args == "gingerbread" || args == "turbokartracers") {minigame = "TKR"; players = gc.legacy.tkr}
        else if (args == "quake" || args == "qc" || args == "quakecraft") {minigame = "Quakecraft"; players = gc.legacy.quake}
        else if (args == "walls" || args == "thewalls") {minigame = "The Walls"; players = gc.legacy.walls}
        else if (args == "paintball" || args == "pb") {minigame = "Paintball"; players = gc.legacy.paintball}
        else if (args == "woolwars" || args == "woolgame" || args == "ww" || args == "wool" || args == "wools" || args == "woolgames") {minigame = "Wool Wars"; players = gc.woolwars}
        else if (args == "warlords" || args == "warlord" || args == "battleground") {minigame = "Warlords"; players = gc.warlords}
        else if (args == "duels" || args == "duel") {minigame = "Duels"; players = gc.duels}
        else if (args == "pit" || args == "thepit" || args == "hypixelpit") {minigame = "The Pit"; players = gc.pit}
        else if (args == "smp" || args == "survival") {minigame = "SMP"; players = gc.smp}
        else if (args == "main" || args == "mainlobby") {minigame = "Main Lobby"; players = gc.mainlobby}
        else if (args == "tourney" || args == "tournamentlobby" || args == "tourneylobby" || args == "tournament" || args == "tour" || args == "tourlobby") {minigame = "Tournament Lobby"; players = gc.tourneylobby}
        else if (args == "supersmash" || args == "supersmashheroes" || args == "ssh") {minigame = "Super Smash Heroes"; players = gc.supersmash}
        else if (args == "replay") {minigame = "Replay"; players = gc.replay}
        else if (args == "blitz" || args == "blitzsg" || args == "survivalgames" || args == "sg" || args == "blitzsurvivalgames" || args == "bsg") {minigame = "Blitz SG"; players = gc.blitz}
        else if (args == "buildbattle" || args == "bb" || args == "build") {minigame = "Build Battle"; players = gc.buildbattle}
        else if (args == "uhc" || args == "ultrahardcore" || args == "uhcchampions") {minigame = "UHC"; players = gc.uhc}
        else if (args == "speeduhc" || args == "speedultrahardcore") {minigame = "SpeedUHC"; players = gc.speeduhc}
        else if (args == "prototype" || args == "ptl" || args == "pt") {minigame = "Prototype"; players = gc.prototype.players}
        else if (args == "pixelparty" || args == "pp" || args == "pixel") {minigame = "Pixel Party"; players = gc.prototype.pixelparty}
        else if (args == "tntgames" || args == "tnt") {minigame = "TNT Games"; players = gc.tntgames}
        else if (args == "cac" || args == "cvc" || args == "copsvcrims" || args == "copsncrims" || args == "crims" || args == "copsandcrims" || args == "c&c") {minigame = "Cops and Crims"; players = gc.cac}
        else if (args == "housing") {minigame = "Housing"; players = gc.housing}
        else if (args == "mw" || args == "megawalls" || args == "megaw") {minigame = "Mega Walls"; players = gc.mw}
        else if (args == "arcade" || args == "arcadegames") {minigame = "Arcade Games"; players = gc.arcade}
        else if (args == "queue") {minigame = "Queue"; players = gc.queue}
        else if (args == "limbo") {minigame = "Limbo"; players = gc.limbo}
        else if (args == "idle") {minigame = "Idle"; players = gc.idle}
        else if (args == "fulllimbo" || args == "limboandidle" || args == "limboidle" || args == "limbo&idle") {minigame = "Limbo & Idle"; players = gc.limbo+gc.idle}
        else if (args == "hypixel" || args == "overall" || args == "all" || args == "hypixelnetwork" || args == "network") {minigame = "Hypixel Network"; players = api.gamecounts.playerCount}
        else return "Neznámá minihra"
        let message = `${minigame} - ${uhg.f(players)} Players`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v Gamecount příkazu!"
      }
    }
  }
  
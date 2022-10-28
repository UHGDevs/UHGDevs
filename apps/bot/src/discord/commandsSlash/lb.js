const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');

const buttons = new MessageActionRow()
  .addComponents(new MessageButton().setCustomId('LBFirst').setStyle('PRIMARY').setEmoji('⏮'))
  .addComponents(new MessageButton().setCustomId('LBBack').setStyle('PRIMARY').setEmoji('◀'))
  .addComponents(new MessageButton().setCustomId('LBNext').setStyle('PRIMARY').setEmoji('▶'))
  .addComponents(new MessageButton().setCustomId('LBLast').setStyle('PRIMARY').setEmoji('⏭'));
const guildrefresh = require('../../utils/guildrefresh');
module.exports = {
  name: 'lb',
  description: 'CZSK Players leaderboards',
  permissions: [],
  options: [
    {
      name: "minigame",
      description: "Vyber si minihru",
      type: "STRING",
      required: true,
      choices: [
        {
          name: 'General',
          value: 'general'
        },
        {
          name: 'Arena Brawl',
          value: 'arena'
        },
        {
          name: 'BedWars',
          value: 'bedwars'
        },
        {
          name: 'Blitz SG',
          value: 'blitz'
        },
        {
          name: 'Build Battle',
          value: 'bb'
        },
        {
          name: 'Cops and Crims',
          value: 'cac'
        },
        {
          name: 'Duels',
          value: 'duels'
        },
        {
          name: 'Mega Walls',
          value: 'megawalls'
        },
        {
          name: 'Murder Mystery',
          value: 'murder'
        },
        {
          name: 'Paintball',
          value: 'paintball'
        },
        {
          name: 'Quakecraft',
          value: 'quake'
        },
        {
          name: 'SkyWars',
          value: 'skywars'
        },
        {
          name: 'Smash Heroes',
          value: 'smash'
        },
        {
          name: 'The Pit',
          value: 'pit'
        },
        {
          name: 'The Walls',
          value: 'thewalls'
        },
        {
          name: 'Turbo Kart Racers',
          value: 'tkr'
        },
        {
          name: 'VampireZ',
          value: 'vampirez'
        },
        {
          name: 'Warlords',
          value: 'warlords'
        },
        {
          name: 'Wool Wars',
          value: 'ww'
        }
      ]
    },
    {
      name: 'stat',
      description: 'Vyber si stat, který chceš vidět',
      type: 'STRING',
      required: false,
      autocomplete: true
    },
    {
      name: 'gamemode',
      description: 'Vyber si gamemode, který chceš vidět',
      type: 'STRING',
      required: false,
      autocomplete: true
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
    try {
      Array.prototype.chunk = uhg.chunk
      let game = interaction.options.getString('minigame')
      let stat = interaction.options.getString('stat') || 'level'
      let gamemode = interaction.options.getString('gamemode') || 'overall'

      let customstat;

      let data = uhg.data.stats.length ? uhg.data.stats : await uhg.mongo.run.get("stats", "stats")

      if ((game == 'duels' || game == 'arena' || game == 'quake' || game == 'murder' || game == 'bb' || game == 'thewalls' || game == 'vampirez' || game == 'warlords' || game == 'megawalls') && stat == 'level') stat = 'wins'
      else if (game == 'tkr' && stat == 'level') stat = 'gold'
      else if ((game == "paintball" || game == 'cac' || game == 'blitz') && stat == 'level') stat = "kills"
      else if (game == 'pit' && stat == 'level') stat = 'xp'

      let lb = { players: [], send: [] }
      data.forEach(player => {
        if (game !== 'general' && !player.stats[game]) return //console.log(player)
        let gamemode_api;
        if (game !== 'general') gamemode_api = player.stats[game][gamemode] || player.stats[game]
        else gamemode_api = player
        
        let stats = gamemode_api[stat]
        customstat = stat; //  example: 'prestige' or 'wins'
        let customstats; // example: '[XIV-101]' or '1,454'
        if (game == 'pit' && (stat == 'xp' || stat == 'rawplaytime')) {         // CUSTOM PIT
          if (stat == 'xp') {customstats = `[${gamemode_api.prestigeroman}-${gamemode_api.level}]`; customstat = 'prestige'}
          else if (stat == 'rawplaytime') {customstats = `${Math.floor(gamemode_api.playtime)}h`; customstat = 'playtime'}
        }
        else if (game == 'skywars' && (stat == 'rawplaytime')) {                // CUSTOM SKYWARS
          customstats = `${Math.floor(gamemode_api.playtime)}h`
          customstat = 'playtime'
        }
        else customstats = uhg.f(stats)
        if (game == 'general' && stat == 'wins') stats = player.stats.wins.total

        if (!stats && stats !== 0 && game !== 'general') stats = player.stats[game][stat]
        if (!stats && stats !== 0) return

        lb.players.push({ username: player.username, stat: stats, customstats: customstats })
      });

      lb.players.sort((a, b) => b.stat - a.stat).forEach((a, i) => { lb.send.push(`\`#${i+1}\` **${a.username}:** \`${a.customstats}\``) });
      lb.send = lb.send.chunk(20)

      let title = `CZSK ${uhg.renameHypixelGames(game)} ${gamemode} ${customstat} leaderboard`

      let embeds = []
      lb.send.forEach((a, i)=>{
        let value = a.join("\n")
        let embed = new MessageEmbed()
          .setDescription('ㅤ')
          .setColor(5592575)
          .setFooter({ text: `${i+1}/${lb.send.length}` })
          .setTitle(title)
          .addFields({ name: 'ㅤ', value: value, inline: false});
        embeds.push(embed)
      })

      if (!embeds.length) {
        let embed = new MessageEmbed()
          .setDescription('ㅤ')
          .setColor(5592575)
          .setFooter({ text: `${0}/${lb.send.length}` })
          .setTitle(title)
          .addFields({ name: 'ㅤ', value: '**V databázi nejsou uloženi žádní hráči**', inline: false });
        embeds.push(embed)
      }

      let cache = JSON.parse(fs.readFileSync('src/settings/cache/lb.json', 'utf8'));
      cache[title] = embeds
      await fs.writeFile('src/settings/cache/lb.json', JSON.stringify(cache, null, 4), 'utf8', data =>{})

      await interaction.editReply({ embeds: [embeds[0]], components: [buttons] })
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return 'Chyba v lb příkazu!'
    }
  }
}

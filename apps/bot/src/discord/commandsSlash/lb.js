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
          name: 'BedWars',
          value: 'bedwars'
        },
        {
          name: 'SkyWars',
          value: 'skywars'
        },
        {
          name: 'General',
          value: 'general'
        },
        {
          name: 'Arena Brawl',
          value: 'arena'
        },
        {
          name: 'Murder Mystery',
          value: 'murder'
        },
        {
          name: 'TKR',
          value: 'tkr'
        },
        {
          name: 'Duels',
          value: 'duels'
        },
        {
          name: 'Quakecraft',
          value: 'quake'
        },
        {
          name: 'Wool Wars',
          value: 'ww'
        },
        {
          name: 'Build Battle',
          value: 'bb'
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

      let data = uhg.data.stats.length ? uhg.data.stats : await uhg.mongo.run.get("stats", "stats")

      if ((game == 'duels' || game == 'arena' || game == 'quake' || game == 'murder' || game == 'bb') && stat == 'level') stat = 'wins'
      else if (game == 'tkr' && stat == 'level') stat = 'gold'

      let lb = { players: [], send: [] }
      data.forEach(player => {
        if (game !== 'general' && !player.stats[game]) return //console.log(player)
        let gamemode_api;
        if (game !== 'general') gamemode_api = player.stats[game][gamemode] || player.stats[game]
        else gamemode_api = player
        let stats = gamemode_api[stat]
        if (game == 'general' && stat == 'wins') stats = player.stats.wins.total

        if (!stats && stats !== 0 && game !== 'general') stats = player.stats[game][stat]
        if (!stats && stats !== 0) return

        lb.players.push({ username: player.username, stat: stats })
      });

      lb.players.sort((a, b) => b.stat - a.stat).forEach((a, i) => { lb.send.push(`\`#${i+1}\` **${a.username}:** \`${uhg.f(a.stat)}\``) });
      lb.send = lb.send.chunk(20)

      let title = `CZSK ${uhg.renameHypixelGames(game)} ${gamemode} ${stat} leaderboard`

      let embeds = []
      lb.send.forEach((a, i)=>{
        let value = a.join("\n")
        let embed = new MessageEmbed()
          .setDescription('ㅤ')
          .setColor(5592575)
          .setFooter({ text: `${i+1}/${lb.send.length}` })
          .setTitle(title)
          .addField('ㅤ', value, false);
        embeds.push(embed)
      })

      if (!embeds.length) {
        let embed = new MessageEmbed()
          .setDescription('ㅤ')
          .setColor(5592575)
          .setFooter({ text: `${0}/${lb.send.length}` })
          .setTitle(title)
          .addField('ㅤ', '**V databázi nejsou uloženi žádní hráči**', false);
        embeds.push(embed)
      }

      let cache = JSON.parse(fs.readFileSync('settings/cache/lb.json', 'utf8'));
      cache[title] = embeds
      await fs.writeFile('settings/cache/lb.json', JSON.stringify(cache, null, 4), 'utf8', data =>{})

      await interaction.editReply({ embeds: [embeds[0]], components: [buttons] })
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return 'Chyba v lb příkazu!'
    }
  }
}

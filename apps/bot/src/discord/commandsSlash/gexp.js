const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fs = require('fs');

const buttons = new MessageActionRow()
  .addComponents(new MessageButton().setCustomId('GEXPFirst').setStyle('PRIMARY').setEmoji('⏮'))
  .addComponents(new MessageButton().setCustomId('GEXPBack').setStyle('PRIMARY').setEmoji('◀'))
  .addComponents(new MessageButton().setCustomId('GEXPNext').setStyle('PRIMARY').setEmoji('▶'))
  .addComponents(new MessageButton().setCustomId('GEXPLast').setStyle('PRIMARY').setEmoji('⏭'));
const guildrefresh = require('../../utils/guildrefresh');
module.exports = {
  name: 'gexp',
  description: 'guild experience command',
  permissions: [],
  options: [
    {
      name: "period",
      description: "Vyber si časový úsek, který chceš vidět",
      type: "STRING",
      required: true,
      choices: [
        {
          name: 'monthly',
          value: 'm',
        },
        {
          name: 'weekly',
          value: 'w',
        },
        {
          name: 'daily',
          value: 'd',
        }
      ]
    },
    {
      name: 'guild',
      description: 'Kterou guildu chceš vidět?',
      type: 'STRING',
      required: true,
      choices: [
        {
            name: 'UHG',
            value: 'UltimateHypixelGuild'
        },
        {
            name: 'TKJK',
            value: 'TKJK'
        },
        {
            name: 'CZSK',
            value: 'Czech Team'
        }
      ]
    },
    {
      name: 'datum',
      description: 'Jaký den nebo měsíc chceš vidět?',
      type: 'STRING',
      required: false
    }
  ],
  type: 'slash',
  run: async (uhg, interaction, args) => {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
    try {
      Array.prototype.chunk = uhg.chunk
      let period = interaction.options.getString('period')
      let guild = interaction.options.getString('guild')
      let tm = interaction.options.getString('datum') || null

      if (tm) tm = tm.replace(/\D/g, " ").split(" ").filter(n => n)
      else tm = []
      if (tm.length) tm.forEach((o, i)=>{ tm[i] = String((Number(o) < 10 ? "0" : "") + o)})

      let now = new Date()
      let time = new Date().toISOString().slice(0, 10);

      let t = time.split("-")
      let ft;
      if (period == 'm') ft = { y:tm[1]||t[0], m:tm[0]||t[1], d: "01" }
      else if (period == 'd') ft = { y:tm[2]||t[0], m:tm[1]||t[1], d: tm[0]||t[2] }
      else ft = { y:t[0], m:t[1], d: t[2] }
      time = Object.values(ft).join("-")

      let descinfo = `${ft.d}. ${ft.m}. ${ft.y}\n`
      if (period == 'm') descinfo = `${ft.m}. měsíc ${ft.y}\n`
      else if (period == 'w') descinfo = ``

      let title = `DENNÍ GEXP - ${guild} - ${ft.d}. ${ft.m}. ${ft.y}`
      if (period == 'm') title = `MĚSÍČNÍ GEXP - ${guild} - ${ft.m}. ${ft.y}`
      else if (period == 'w') title = `TÝDENNÍ GEXP - ${guild}`

      let cache = JSON.parse(fs.readFileSync('settings/cache/gexp.json', 'utf8'));
      if (cache[title] && cache[title].length) interaction.editReply({ embeds:[cache[title][0]] })

      let data = await guildrefresh(uhg, guild)
      data = data.data

      let members = data.members
      let left = data.left

      let scaled = 0
      if (period == 'm') {
        let sday = Object.keys(data.dailyxp).filter(n=>n.startsWith(time.slice(0,7)))
        for (let i = 0; i < sday.length; i++) {
          scaled += data.dailyxp[sday[i]]
        }
      } else if (period == 'w') {
        for (let i=0; i<7;i++) {
          scaled += Object.values(data.dailyxp)[i]
        }
      } else scaled = data.dailyxp[time] || 0


      let lb = { members: [], left: [], send: [], lsend: []}
      let totalgexp = 0

      members.forEach(member => {
        let membergexp = 0
        let days;

        if (period == 'd') days = Object.keys(member.exp.daily).filter(n => n == time)
        else if (period == "w") days = Object.keys(member.exp.daily).slice(0, 7)
        else days = Object.keys(member.exp.daily).filter(n=>n.startsWith(time.slice(0,7)))

        for (let den of days) {
          totalgexp += member.exp.daily[den] || 0
          membergexp += member.exp.daily[den] || 0
        }

        lb.members.push({name: member.name, gexp: membergexp})
      });

      left.forEach(member => {
        let membergexp = 0
        let days;

        if (period == 'd') days = Object.keys(member.exp.daily).filter(n => n == time)
        else if (period == "w") days = Object.keys(member.exp.daily).slice(0, 7)
        else days = Object.keys(member.exp.daily).filter(n=>n.startsWith(time.slice(0,7)))

        for (let den of days) {
          totalgexp += member.exp.daily[den] || 0
          membergexp += member.exp.daily[den] || 0
        }
        if (membergexp) lb.left.push({name: member.name, gexp: membergexp})
      });

      lb.members.sort((a, b) => b.gexp-a.gexp).forEach((a,i)=>{lb.send.push(`\`#${i+1}\` **${a.name}:** \`${uhg.f(a.gexp)} GEXP\``)})
      lb.left.sort((a, b) => b.gexp-a.gexp).forEach((a,i)=>{lb.lsend.push(`\`•\` **${a.name}:** \`${uhg.f(a.gexp)} GEXP\``)})

      lb.send = lb.send.chunk(20)
      lb.lsend = lb.lsend.chunk(20)

      let pages = lb.send.length + lb.lsend.length
      let embeds = []

      lb.send.forEach((a, i)=>{
        let value = a.join("\n")
        let embed = new MessageEmbed()
          .setDescription(`${descinfo}Total GEXP: \`${uhg.f(totalgexp)}\`\nScaled GEXP: \`${uhg.f(scaled)}\`\nLevel: \`${uhg.f(uhg.ggl(scaled))}\``)
          .setColor(5592575)
          .setFooter({ text: `${i+1}/${pages}` })
          .setTitle(title)
          .addField('ㅤ', value, false);
        embeds.push(embed)
      })

      lb.lsend.forEach((a, i)=>{
        let value = a.join("\n")
        let embed = new MessageEmbed()
          .setDescription(`${descinfo}Total GEXP: \`${uhg.f(totalgexp)}\`\nScaled GEXP: \`${uhg.f(scaled)}\`\nLevel: \`${uhg.f(uhg.ggl(scaled))}\``)
          .setColor(5592575)
          .setFooter({ text: `${i + 1 + lb.send.length}/${pages}` })
          .setTitle(title)
          .addField("Lidi, kteří guildu odpojili", value, false);
        embeds.push(embed)
      })

      await interaction.editReply({ embeds: [embeds[0]], components: [buttons] })

      cache = JSON.parse(fs.readFileSync('settings/cache/gexp.json', 'utf8'));
      cache[title] = embeds
      await fs.writeFile('settings/cache/gexp.json', JSON.stringify(cache, null, 4), 'utf8', data =>{})

    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v gexp příkazu!"
    }
  }
}

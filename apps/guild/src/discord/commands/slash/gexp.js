
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const path = require('node:path');
const fs = require('fs');

const buttons = new ActionRowBuilder()
  .addComponents(new ButtonBuilder().setCustomId('gexp_first').setStyle(ButtonStyle.Primary).setEmoji('⏮'))
  .addComponents(new ButtonBuilder().setCustomId('gexp_back').setStyle(ButtonStyle.Primary).setEmoji('◀'))
  .addComponents(new ButtonBuilder().setCustomId('gexp_next').setStyle(ButtonStyle.Primary).setEmoji('▶'))
  .addComponents(new ButtonBuilder().setCustomId('gexp_last').setStyle(ButtonStyle.Primary).setEmoji('⏭'));

module.exports = {
    name: 'gexp',
    description: 'GEXP 2 největších cz/sk guild!',
    permissions: [],
    options: [
      {
        name: "period",
        description: "Vyber si časový úsek, který chceš vidět",
        type: 3,
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
        type: 3,
        required: false,
        choices: [
          {
              name: 'UHG',
              value: 'uhg'
          },
          {
              name: 'TKJK',
              value: 'tkjk'
          }
        ]
      },
      {
        name: 'datum',
        description: 'Jaký den nebo měsíc chceš vidět?',
        type: 3,
        required: false
      }
    ],
    type: 'slash',
    platform: 'discord',
    run: async (uhg, interaction) => {
      await interaction.deferReply({ ephemeral: false })

      let period = interaction.options.getString('period')
      let guild = interaction.options.getString('guild') || 'uhg'
      let tm = interaction.options.getString('datum')
      tm = tm?.replace(/\D/g, " ").split(" ").filter(n => n).forEach((o, i)=>{ tm[i] = String((Number(o) < 10 ? "0" : "") + o)}) || []

      let time = new Date().toISOString().slice(0, 10).split("-")
      let ft;
      if (period == 'm') ft = { y:tm[1]||time[0], m:tm[0]||time[1], d: "01" }
      else if (period == 'd') ft = { y:tm[2]||time[0], m:tm[1]||time[1], d: tm[0]||time[2] }
      else ft = { y:time[0], m:time[1], d: time[2] }
      time = Object.values(ft).join("-")

      let descinfo = `${ft.d}. ${ft.m}. ${ft.y}\n`
      if (period == 'm') descinfo = `${ft.m}. měsíc ${ft.y}\n`
      else if (period == 'w') descinfo = ``

      let title = `DENNÍ GEXP - ${guild} - ${ft.d}. ${ft.m}. ${ft.y}`
      if (period == 'm') title = `MĚSÍČNÍ GEXP - ${guild} - ${ft.m}. ${ft.y}`
      else if (period == 'w') title = `TÝDENNÍ GEXP - ${guild}`


      let members = await uhg.get(guild, 'members', {})
      let left = await uhg.get(guild, 'left', {})
      let info = await uhg.get(guild, 'info', { _id: 'xp' }).then(n => n[0])

      let scaled = 0
      if (period == 'm') {
        let sday = Object.keys(info.daily).filter(n=>n.startsWith(time.slice(0,7)))
        for (let i = 0; i < sday.length; i++) {
          scaled += info.daily[sday[i]]
        }
      } else if (period == 'w') {
        for (let i=0; i<7;i++) {
          scaled += Object.values(info.daily)[i]
        }
      } else scaled = info.daily[time] || 0


      let lb = { members: [], left: [], send: [], lsend: []}
      let totalgexp = 0

      members.forEach(member => {
        let membergexp = 0
        let days;

        if (period == 'd') days = Object.keys(member.gexp).filter(n => n == time)
        else if (period == "w") days = Object.keys(member.gexp).slice(0, 7)
        else days = Object.keys(member.gexp).filter(n=>n.startsWith(time.slice(0,7)))

        for (let den of days) {
          totalgexp += member.gexp[den] || 0
          membergexp += member.gexp[den] || 0
        }

        lb.members.push({name: member.username, gexp: membergexp})
      });

      left.forEach(member => {
        let membergexp = 0
        let days;

        if (period == 'd') days = Object.keys(member.gexp).filter(n => n == time)
        else if (period == "w") days = Object.keys(member.gexp).slice(0, 7)
        else days = Object.keys(member.gexp).filter(n=>n.startsWith(time.slice(0,7)))

        for (let den of days) {
          totalgexp += member.gexp[den] || 0
          membergexp += member.gexp[den] || 0
        }
        if (membergexp) lb.left.push({name: member.username, gexp: membergexp})
      });

      lb.members.sort((a, b) => b.gexp-a.gexp).forEach((a,i)=>{lb.send.push(`\`#${i+1}\` **${a.name}:** \`${f(a.gexp)} GEXP\``)})
      lb.left.sort((a, b) => b.gexp-a.gexp).forEach((a,i)=>{lb.lsend.push(`\`•\` **${a.name}:** \`${f(a.gexp)} GEXP\``)})

      lb.send = chunk(lb.send, 20)
      lb.lsend = chunk(lb.lsend, 20)

      let pages = lb.send.length + lb.lsend.length
      let embeds = []

      lb.send.forEach((a, i)=>{
        let value = a.join("\n")
        let embed = new EmbedBuilder()
          .setDescription(`${descinfo}Total GEXP: \`${f(totalgexp)}\`\nScaled GEXP: \`${f(scaled)}\`\nLevel: \`${f(ggl(scaled))}\``)
          .setColor(5592575)
          .setFooter({ text: `${i+1}/${pages}` })
          .setTitle(title)
          .addFields({ name: 'ㅤ', value: value, inline: false });
        embeds.push(embed)
      })

      lb.lsend.forEach((a, i)=>{
        let value = a.join("\n")
        let embed = new EmbedBuilder()
          .setDescription(`${descinfo}Total GEXP: \`${f(totalgexp)}\`\nScaled GEXP: \`${f(scaled)}\`\nLevel: \`${f(ggl(scaled))}\``)
          .setColor(5592575)
          .setFooter({ text: `${i + 1 + lb.send.length}/${pages}` })
          .setTitle(title)
          .addFields({ name: "Lidi, kteří guildu odpojili", value: value, inline: false });
        embeds.push(embed)
      })

      await interaction.editReply({ embeds: [embeds[0]], components: [buttons] })

      let cache = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../cache/gexp.json'), 'utf8'));
      cache[title] = embeds
      await fs.writeFile(path.join(__dirname, '../../../../cache/gexp.json'), JSON.stringify(cache, null, 4), 'utf8', data =>{})

    }
}
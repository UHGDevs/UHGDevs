
const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]
const Parser = require('rss-parser');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js')

module.exports = {
  name: eventName,
  description: "Forums CHECKER",
  emoji: '📜',
  time: '0 * * * * *', //'*/10 * * * * *'
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg, options) => {
    let parser = new Parser()
    let feedMain = await parser.parseURL('https://hypixel.net/forums/news-and-announcements.4/-/index.rss')
    let feedSb = await parser.parseURL('https://hypixel.net/forums/skyblock-patch-notes.158/-/index.rss')

    let data = await uhg.get('general', 'forums')
    let maxValueMain = Math.max(...data.filter(n => n.category == "main").map(o => o.guid))
    let maxValueSb = Math.max(...data.filter(n => n.category == "sb").map(o => o.guid))

    let feed = {main: feedMain.items, sb: feedSb.items}

    for (let i in { ...feed.main, ...feed.sb }) {
      let category;
      if (feed.main[i].guid > maxValueMain) category = 'main'
      else if (feed.sb[i].guid > maxValueSb) category = 'sb'
      if (category) {// provede se pokud guid článku je větší než nejvyšší guid v databázi pod tou kategorií konkrétní
        await uhg.post("general", "forums", {_id:Number(data.length), title: feed[category][i].title, pubDate: feed[category][i].pubDate, creator: feed[category][i].creator, link: feed[category][i].link, guid: feed[category][i].guid, category: category})
        let channel = await dc_client.channels.cache.get('875503798733385779') // ADMIN CHAT 530496801782890527
        let embed = { title: 'NOVÝ FORUM ANNOUNCEMENT', description: 'Rozhodni, zda se má forum článek poslat do Oznámení', fields: [ { name: 'ㅤ', value: 'ㅤ', inline: false }, { name: `${feed[category][i].title}`, value: `${feed[category][i].link}` }, { name: 'ㅤ', value: 'ㅤ', inline: false } ], footer: { text: `\nUHGDevs (ID: ${Number(data.length)})` }, color: 0xff0000, url: feed[category][i].link }
        
        let buttons = new ActionRowBuilder()
          .addComponents(new ButtonBuilder()
              .setCustomId(`oznameni_cmd_add_true`)
              .setStyle(3)
              .setLabel("Dát do Oznámení")
          )
          .addComponents(new ButtonBuilder()
              .setCustomId(`oznameni_cmd_add_false`)
              .setStyle(4)
              .setLabel("Nedávat do Oznámení")
          );
        channel.send( { embeds: [embed], components: [buttons] } )
      }
    }

    
  }
}
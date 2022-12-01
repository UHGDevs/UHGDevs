const time = require('../../utils/timehandler.js')
const Parser = require('rss-parser');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "Automatické kontrolování Hypixel Forums",
  emoji: '📜',
  time: '0 * * * * *', //'*/10 * * * * *'
  ignore: '* * 0,23 * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: true,
  run: async (uhg) => {
    let date = new Date()
    let event = time.start(uhg, eventName)
    try {
        let parser = new Parser();
        let feedMain = await parser.parseURL('https://hypixel.net/forums/news-and-announcements.4/-/index.rss');
        let feedSb = await parser.parseURL('https://hypixel.net/forums/skyblock-patch-notes.158/-/index.rss')
        let data = await uhg.mongo.run.get('general', 'forums')
        let dataMain = data.filter(n => n.category == "main")
        let dataSb = data.filter(n => n.category == "sb")
        let maxValueMain = 5133475//Math.max(...dataMain.map(o => o.guid))
        let maxValueSb = 5133475//Math.max(...dataSb.map(o => o.guid))
        
        let feed = {main: feedMain.items, sb: feedSb.items}

        for (let i in { ...feed.main, ...feed.sb }) {
          let category;
          if (feed.main[i].guid > maxValueMain && !data.filter(n => n.guid == feed.main[i].guid).length) category = 'main'
          else if (feed.sb[i].guid > maxValueSb && !data.filter(n => n.guid == feed.sb[i].guid).length) category = 'sb'
          if (category) {// provede se pokud guid článku je větší než nejvyšší guid v databázi pod tou kategorií konkrétní
            await uhg.mongo.run.post("general", "forums", {_id:Number(data.length), title: feed[category][i].title, pubDate: feed[category][i].pubDate, creator: feed[category][i].creator, link: feed[category][i].link, guid: feed[category][i].guid, category: category})
            let channel = await uhg.dc.client.channels.cache.get('530496801782890527') // ADMIN CHAT
            let embed = new MessageEmbed().setTitle('NOVÝ FORUM ANNOUNCEMENT').setDescription('Rozhodni, zda se má forum článek poslat do Oznámení').addFields( { name: 'ㅤ', value: 'ㅤ', inline: false }, { name: `${feed[category][i].title}`, value: `${feed[category][i].link}` }, { name: 'ㅤ', value: 'ㅤ', inline: false } ).setFooter( { text: `\nUHGDevs (ID: ${Number(data.length)})` } ).setColor(0xff0000).setURL(feed[category][i].link)
            
            let buttons = new MessageActionRow()
              .addComponents(new MessageButton()
                  .setCustomId(`FORUMS_true`)
                  .setStyle("SUCCESS")
                  .setLabel("Dát do Oznámení")
              )
              .addComponents(new MessageButton()
                  .setCustomId(`FORUMS_false`)
                  .setStyle("DANGER")
                  .setLabel("Nedávat do Oznámení")
              );
            channel.send( { embeds: [embed], components: [buttons] } )
          }
        }

     } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}

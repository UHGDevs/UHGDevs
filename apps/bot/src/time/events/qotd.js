const time = require('../../utils/timehandler.js')
const { MessageEmbed } = require('discord.js');

const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

module.exports = {
  name: eventName,
  description: "UHG QOTD",
  emoji: '❓',
  time: '0 0 14 * * *', //'*/10 * * * * *'
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: false,
  run: async (uhg) => {
    let date = new Date()
    let event = time.start(uhg, eventName)
    try {
      let channel = uhg.dc.client.channels.cache.get('1015355454882316288')
      channel.threads.cache.filter(x => x.isThread() && !x.locked).forEach(async (thread) => {
        await thread.setLocked()
        await thread.setArchived()
      })


      let qotd = await uhg.mongo.run.get('general', 'qotd', {}).then(n => n.filter(a => !a.completed).sort((a, b) => a._id - b._id))
      if (!qotd.length) return uhg.dc.client.channels.cache.get('530496801782890527').send({ content: 'Není žádný QOTD!' })
      let question = qotd[0].question
      let day = qotd[0]._id
      let desc = `${question}\n\nOdpovídejte v threadu!`

      let embed = new MessageEmbed().setTitle(`Question of the Day ${day}`).setDescription(desc)

      let msg = await channel.send({ content: '<@&1015349927318139022>', embeds: [embed] })
      let thread = await msg.startThread({name: `QOTD ${day} - ${question}` })

      await uhg.mongo.run.update('general', 'qotd', {_id: day}, {completed: true, message: msg.id, thread: thread.id})

    } catch(e) {
      if (uhg.dc.cache.embeds) uhg.dc.cache.embeds.timeError(e, eventName);
      else console.log(String(e.stack).bgRed + 'Time error v2');
    } finally {
      time.end(uhg, eventName)
    }
  }
}

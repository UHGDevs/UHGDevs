
const eventName = module.filename.includes('/') ? module.filename.split('/').filter(n => n.endsWith('.js'))[0].split('.')[0] : module.filename.split('\\').filter(n => n.endsWith('.js'))[0].split('.')[0]

let updateMembers = 50

module.exports = {
  name: eventName,
  description: "QOTD for UHG",
  emoji: '❓',
  time: '0 0 7 * * *', //'*/10 * * * * *'
  ignore: '* * * * * *', //'sec min hour den(mesic) mesic den(tyden)'
  onstart: false,
  run: async (uhg, options) => {

    let channel = dc_client.channels.cache.get('1015355454882316288')
    channel?.threads.cache.filter(x => x.isThread() && !x.locked).forEach(async (thread) => {
      await thread.setLocked()
      await thread.setArchived()
    })


    let qotd = await uhg.get('general', 'qotd').then(n => n.filter(a => !a.completed).sort((a, b) => a._id - b._id))
    if (!qotd.length) return dc_client.channels.cache.get('530496801782890527').send({ content: 'Není žádný QOTD!' })
    let question = qotd[0].question
    let day = qotd[0]._id
    let desc = `${question}\n\nOdpovídejte v threadu!`

    let embed = new MessageEmbed().setTitle(`Question of the Day ${day}`).setDescription(desc)

    let msg = await channel.send({ content: '<@&1015349927318139022>', embeds: [embed] })
    let thread = await msg.startThread({name: `QOTD ${day} - ${question}`.slice(0, 100) })

    await uhg.post('general', 'qotd', {_id: day, completed: true, message: msg.id, thread: thread.id})

    if (qotd.length == 1) dc_client.users.cache.get('660441379310272513')?.send({ content: 'Není žádný QOTD!' })

  }
}
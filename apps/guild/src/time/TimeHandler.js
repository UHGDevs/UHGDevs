
const cron  = require('cron');
const path = require('node:path');
const fs = require('fs');
const { Collection } = require('discord.js');

class TimeHandler {
  constructor(uhg) {

    this.uhg = uhg
    this.ready = {}
    this.running = {}
    this.events = new Collection()

  }

    async init() {
        const files = fs.readdirSync(path.join(__dirname, './events')).filter((file) => file.endsWith(".js"));
        let eventsClass = this
        let running = 0
        let events = []
        for (const file of files) {
            let pull = require(`./events/${file}`)
            this.ready[pull.name] = true
            if (global.config.time[pull.name] === undefined) await this.uhg.editConfig(`time/${pull.name}`, false)

            pull.start = new cron.CronJob(
                pull.time,
                async function() {
                    if(!eventsClass.ready[pull.name] || !global.config.time[pull.name]) return
                    eventsClass.eventStart(pull)
                    eventsClass.running[pull.name] = pull.run(eventsClass.uhg, {}).catch(async (e) => {
                      let err = await console.error(e, 'Time Event ERROR')
                      global.logging_channel?.send({ embeds: [err] })
                    });
                    
                    await eventsClass.running[pull.name]
                    eventsClass.eventEnd(pull)
                }
            )
            pull.ignore.split(" ").forEach((unit, i) => {
            if (unit == "*") return
            unit.split(",").forEach(t => {delete pull.start.cronTime[this.getDict(i)][t]});
            });
            pull.start.start()
            
            if (global.config.time[pull.name] === true) running++
            this.events.set(pull.name, pull)
            events.push(pull)
        }

        console.time(`${running}/${this.events.size} Time Events`);
        let events_2 = []
        events.forEach(n => events_2.push(this.run(n)))
        events = await Promise.all(events_2);
        if (running) console.time('All time events are done')
    }

  getDict(i) {
    if (i===0) return "second"
    else if (i===1) return "minute"
    else if (i===2) return "hour"
    else if (i===3) return "dayOfMonth"
    else if (i===4) return "month"
    else if (i===5) return "dayOfWeek"
    else return "error"
  }

  async run(pull, options = {}) {
    if (global.config.time[pull.name] && pull.onstart === true && this.ready[pull.name]) {
      this.eventStart(pull)
      this.running[pull.name] = pull.run(this.uhg, options).catch(async (e) => {
        let err = await console.error(e, 'Time Event ERROR')
        global.logging_channel?.send({ embeds: [err] })
      });
      
      await this.running[pull.name]
      this.eventEnd(pull)
      return true
    } else return false
  }

  eventStart(event) {
    this.ready[event.name] = false

    event.count = (event.count || 0) + 1
    event.executedAt = new Date()
  }

  eventEnd(event) {
    this.ready[event.name] = true
    this.running[event.name] = undefined

    event.lastTime = new Date().getTime() - event.executedAt.getTime() || 1
    event.times ? event.times.push(event.lastTime) : event.times = [event.lastTime]
    event.averageTime = event.times.reduce((a, b) => a + b, 0) / event.times.length;
  }

}

module.exports = TimeHandler
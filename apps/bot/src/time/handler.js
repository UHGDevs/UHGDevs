const fs = require("fs");
const cron = require('cron');
module.exports = async (uhg) => {
  let running = 0;
  let events = []
  const files = fs.readdirSync(`time/events`).filter((file) => file.endsWith(".js"));
  for (const file of files) {
    let pull = require(`./events/${file}`)
    uhg.time.ready[pull.name]=true

    pull.start = new cron.CronJob(
      pull.time,
      async function() {
        if(!uhg.time.ready[pull.name] || !uhg.settings.time[pull.name]) return
        uhg.time.ready[pull.name]=false
        await pull.run(uhg);
        uhg.time.ready[pull.name]=true
      }
    )
    pull.ignore.split(" ").forEach((unit, i) => {
      if (unit == "*") return
      unit.split(",").forEach(t => {delete pull.start.cronTime[getDict(i)][t]});
    });
    pull.start.start()
    
    if (uhg.settings.time[pull.name]===true) {running+=1}
    uhg.time.events.set(pull.name, pull)

    events.push(run(uhg, pull))
  }

  console.log(`${running}/${uhg.time.events.size} Time Events`.brightGreen);

  events = await Promise.all(events);
  if (running) console.log('All time events are done'.brightGreen)
}
function getDict(i) {
  if (i===0) return "second"
  else if (i===1) return "minute"
  else if (i===2) return "hour"
  else if (i===3) return "dayOfMonth"
  else if (i===4) return "month"
  else if (i===5) return "dayOfWeek"
  else return "error"
}

async function run(uhg, pull) {
  if (uhg.settings.time[pull.name] && pull.onstart === true) {
    uhg.time.ready[pull.name]=false
    await pull.run(uhg);
    uhg.time.ready[pull.name]=true
    return true
  } else return false
}
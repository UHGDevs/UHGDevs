
exports.start = async (uhg, name) => {
  let event = uhg.time.events.get(name)
  event.count = (event.count || 0) + 1
  event.executedAt = new Date()
  if (!event.times) event.times = []
}

exports.end = async (uhg, name) => {
  let event = uhg.time.events.get(name)
  event.lastTime = new Date().getTime() - event.executedAt.getTime() || 1
  event.times.push(event.lastTime)
  event.averageTime = event.times.reduce((a, b) => a + b, 0) / event.times.length;
}

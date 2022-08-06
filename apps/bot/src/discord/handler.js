const fs = require("fs");
module.exports = async (uhg) => {
  let amount = 0;
  const events = () => {
    const files = fs.readdirSync(`discord/events`).filter((file) => file.endsWith(".js"));
    amount = files.length
    for (const file of files) {
      try {
          const event = require(`./events/${file}`)
          let eventName = file.split(".")[0];
          uhg.dc.client.on(eventName, event.bind(null, uhg));
      } catch (e) {
          console.log(e)
          amount -= 1
      }
    }
  }
  await events()
  console.log(`${amount} Events Loaded`.brightGreen);
  require("./commands")(uhg)

}

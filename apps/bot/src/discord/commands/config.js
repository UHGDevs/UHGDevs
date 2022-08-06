const fs = require('fs');
module.exports = {
  name: "config",
  aliases: ["settings"],
  allowedids: ["378928808989949964", "312861502073995265"],
  platform: "dc",
  run: async (uhg, message, content) => {
    try {
      let id = message.author.id
      let auth = ["378928808989949964", "312861502073995265"]
      if (!auth.includes(id)) return

      let data = {}
      let send = []
      for (let [key, value] of Object.entries(uhg.settings)) {
        if (typeof value === 'object' && !Array.isArray(value) && value) {
          for (let [key2, value2] of Object.entries(value)) {
            data[key2] = {name: key2, value: value2, category: key}
            send.push(`${key2}: ${value2} (${key})`)
          }
        } else {
          data[key] = {name: key, value: value}
          send.push(`${key}: ${value}`)
        }
      }

      send = send.join(`\n`)
      if (!content) return send

      let args = content.split(" ").filter(n => n)
      if (!args.length) return send

      if (args[0].toLowerCase() == 'discord' && Number(args[2])) {
        return 'Discord channels coming soon™'
      }

      let item = args[0].toLowerCase();
      if (item == 'prefix') return 'Prefix zatím nelze změnit'
      if (item == 'show') return send
      if (!data[item]) return 'UNKNOWN item'

      let toggle = args[1] || 'get'
      toggle = toggle.toLowerCase()

      let task;
      if (toggle == 'get') return `${data[item].name}: ${data[item].value}`
      else if (toggle == 'enable' || toggle == 'on' || toggle == 'true') task = true
      else if (toggle == 'disable' || toggle == 'off' || toggle == 'false') task = false
      else return 'Další možnosti se zatím nepodporují'

      let settings = uhg.settings
      if (settings[item] !== undefined) {
        if (settings[item] === task) return 'Nastavení tak už je nastaveno'
        settings[item] = task
      } else if (settings.time[item] !== undefined) {
        if (settings.time[item] === task) return 'Nastavení tak už je nastaveno'
        settings.time[item] = task
      }

      await fs.writeFile('settings/config.json', JSON.stringify(settings, null, 4), 'utf8', data =>{})

      return 'DONE'
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v config příkazu!"
    }
  }
}

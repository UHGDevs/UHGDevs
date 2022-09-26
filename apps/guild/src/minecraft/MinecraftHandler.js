

const path = require('node:path');
const fs = require('fs');

let channel;

class MinecraftHandler {
  constructor(uhg) {

    this.uhg = uhg

    this.createCommands()

  }

  async init() {
    
  }

  createCommands() {
    let cmds = new Collection()
    let aliases = new Collection()
    let cmdCount = 0
    for (let file of fs.readdirSync(path.resolve(__dirname, './commands/'))) {
        if (file.endsWith('.js')) {
            cmdCount ++
            try { delete require.cache[require.resolve(`./commands/${file}`)] } catch (e) {}
            try {
              let cmd = require(`./commands/${file}`)
              cmds.set(cmd.name, cmd)
              cmd.aliases.forEach(a => aliases.set(a, cmd.name));
            } catch (e) {console.error(e)}
        } else if (!file.includes('.')) {
            fs.readdirSync(path.resolve(__dirname, './commands/'+file)).forEach(f =>{
                cmdCount ++
                try { delete require.cache[require.resolve(`./commands/${file}/${f}`)] } catch (e) {}
                try {
                  let cmd = require(`./commands/${file}/${f}`)
                  cmds.set(cmd.name, cmd)
                  cmd.aliases?.forEach(a => aliases.set(a, cmd.name));
                } catch (e) {console.error(e)}
            })
        }
    }
   // this.uhg.commands = cmds
   // this.uhg.aliases = aliases
    console.discord(`${this.uhg.commands.size}/${cmdCount} Commands Loaded`)
    return `${this.uhg.commands.size}/${cmdCount} Commands Loaded`
}
  
  
}

module.exports = MinecraftHandler
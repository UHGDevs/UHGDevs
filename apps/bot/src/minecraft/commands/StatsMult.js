module.exports = {
    name: "StatsMult",
    aliases: ["statsmult", "mp", "magicalpower"],
    run: async (uhg, pmsg) => {
      try{
        if (!pmsg.args) return "Prosím, zadej svou Magical Power"
        let MP = pmsg.args.split(" ")[0]
        let pass = 0
        if (MP >= 0) pass = 1
        if (pass == 0) return "Prosím, zadej svou Magical Power"
        const equation = 29.97*(Math.log(0.0019*MP+1))**1.2
        let message = `Staty jsou zvýšeny ${equation.toFixed(2)}x`
        return message
      } catch (e) {
          console.log(String(e.stack).bgRed)
          return "Chyba v StatsMult příkazu!"
      }
    }
  }
  
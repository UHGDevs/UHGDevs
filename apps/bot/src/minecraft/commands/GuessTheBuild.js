//const words = require("../../../database/GuessTheBuild.json")
module.exports = {
  name: "GuessTheBuild",
  aliases: ["gtb", "guess"],
  run: async (uhg, pmsg) => {
    return "Not done"
    try{
      // let args = pmsg.args
      // if (!args) return "Nezadal jsi žádné slovo"
      // let final = [];
      // let find = args.replace(/_/g, '.').toLowerCase();
      // if (!(new RegExp(find)).test(words)) return "Nenalezeno žádné slovo"
      // let i;
      //
      // for (let j=0; j < words.length; j++) {
      //   let value = words[j].toLowerCase();
      //   if (find.length != value.length) continue;
      //   for (i=0; i<find.length; i++) {
      //     if (find[i] == '.') continue;
      //     if (find[i] == '*') continue;
      //     if (find[i] != value[i]) break;
      //   }
      //   if (i == find.length) final.push(value);
      // }
      // console.log(final)
      // final = final.join(", ")||"nic"
      // return final
    } catch (e) {
        console.log(String(e.stack).bgRed)
        return "Chyba v GuessTheBuild příkazu!"
    }
  }
}

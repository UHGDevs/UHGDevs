module.exports = {
    name: "stop",
    aliases: ["stop", "stopcode"],
    allowedids: ["312861502073995265", "378928808989949964", "419183469911080960"],
    platform: "dc",
    run: async (uhg, message, content) => {
        await message.channel.send("Kód byl ukončen")
        throw new Error("Kód byl vynuceně ukončen přes Discord příkaz".bgRed);
    }
  }
  
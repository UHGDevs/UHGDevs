module.exports = {
    name: "StatsMult",
    aliases: ["statsmult", "mp", "magicalpower"],
    type: 'skyblock',
    run: async (uhg, pmsg) => {
        try {
            // Tento příkaz nepotřebuje API, počítá z argumentu
            if (!pmsg.args) return "Prosím, zadej svou Magical Power (např. !mp 500)";
            
            let mp = parseFloat(pmsg.args.split(" ")[0]);
            
            if (isNaN(mp) || mp < 0) return "Prosím, zadej platnou Magical Power.";

            // Vzorec: 29.97 * (ln(0.0019 * MP + 1))^1.2
            const equation = 29.97 * Math.pow(Math.log(0.0019 * mp + 1), 1.2);
            const multiplier = equation.toFixed(2);

            let mcMessage = `Staty jsou zvýšeny ${multiplier}x (při MP ${mp})`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Stats Multiplier Calculator`)
                .setColor(0xAA00AA) // Dark Purple
                .setDescription(`Výpočet pro **${mp}** Magical Power:`)
                .addFields(
                    { name: "Multiplier", value: `**${multiplier}x**`, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command StatsMult: `.red, e);
            return "Chyba při výpočtu.";
        }
    }
};
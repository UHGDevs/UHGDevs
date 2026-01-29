module.exports = {
    name: "Simulators",
    aliases: ["sim", "sims", "simulators", "simulator", "scuba", "grinch"],
    run: async (uhg, pmsg) => {
        try {
            const api = await uhg.api.call(pmsg.username, ["hypixel"]);
            if (!api.success) return api.reason;

            const sim = api.hypixel.stats.arcade.simulators;

            let mcMessage = `**Simulators**: **${api.username}** - Grinch: ${uhg.f(sim.grinch.wins)} | Scuba: ${uhg.f(sim.scuba.wins)} | Easter: ${uhg.f(sim.easter.wins)} | Halloween: ${uhg.f(sim.halloween.wins)}`;

            let dcEmbed = new uhg.dc.Embed()
                .setTitle(`Arcade Simulators - ${uhg.dontFormat(api.username)}`)
                .setColor(0x55FFFF)
                .setThumbnail(uhg.getAvatar(api.uuid))
                .addFields(
                    { name: "Grinch Simulator", value: `Wins: \`${uhg.f(sim.grinch.wins)}\``, inline: true },
                    { name: "Scuba Simulator", value: `Wins: \`${uhg.f(sim.scuba.wins)}\``, inline: true },
                    { name: "Easter Simulator", value: `Wins: \`${uhg.f(sim.easter.wins)}\``, inline: true },
                    { name: "Halloween Simulator", value: `Wins: \`${uhg.f(sim.halloween.wins)}\``, inline: true }
                );

            if (pmsg.command) dcEmbed.setFooter({ text: `Command requested by: ${pmsg.username}` });

            return { mc: mcMessage, dc: dcEmbed };
        } catch (e) {
            console.error(` [ERROR] MC Command Simulators: `.red, e);
            return "Chyba při načítání Simulators statistik.";
        }
    }
};
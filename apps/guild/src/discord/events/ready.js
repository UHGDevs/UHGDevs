
const path = require('node:path');
const fs = require('fs');

module.exports = async (uhg, client) => {

    console.discord('Client ready, logged in as ' + client.user.tag, {startup: true})
    client.user.setActivity('Guild Chat', { type: 'WATCHING' })
    
    if (uhg.config.discord.bot_messages === true) {
        await global.guild_channel?.send({
            embeds: [{ author: { name: `Discord BOT is now Online` }, color: 2067276 }]
        })
    }

    let botSlashCmds = uhg.commands.filter(n => n.type == 'slash' || n.type == 'modal').map(cmd => { return { name: cmd.name, description: cmd.description||"", options: cmd.options || [], default_permission: Array.isArray(cmd.permissions) ? (cmd.permissions.length ? false : true) : true } });
    let cmds = await client.application.commands.set(botSlashCmds)

    global.guilds = {
        uhg: client.guilds.cache.get('455751845319802880'),
        bot: client.guilds.cache.get('758650512827613195'),
        bw: client.guilds.cache.get('874337528621191251'),
        tkjk: client.guilds.cache.get('574281977205620738')
    }
    fs.readdirSync(path.resolve(__dirname, `../../features/`)).map(a => require(`../../features/${a}/handler`)).forEach(n => { uhg[n.name] = n.class })

}
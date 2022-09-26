
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

    let botSlashCmds = uhg.commands.filter(n => n.type == 'slash').map(cmd => { return { name: cmd.name, description: cmd.description||"", options: cmd.options || [], default_permission: Array.isArray(cmd.permissions) ? (cmd.permissions.length ? false : true) : true } });
    let cmds = await client.application.commands.set(botSlashCmds)

    fs.readdirSync(path.resolve(__dirname, `../../features/`)).map(a => require(`../../features/${a}/handler`)).forEach(n => { uhg[n.name] = n.class })

}
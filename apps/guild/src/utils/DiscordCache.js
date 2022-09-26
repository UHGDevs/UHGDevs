
module.exports = async (uhg, client) => {
    global.dc_guild = uhg.config.discord.serverID ? await client.guilds.fetch(uhg.config.discord.serverID).catch(console.error) : null
    global.guild_channel = uhg.config.discord.guildChatChannel ? await client.channels.fetch(uhg.config.discord.guildChatChannel).catch(console.error) : null
    global.officer_channel = uhg.config.discord.officerChannel ? await client.channels.fetch(uhg.config.discord.officerChannel).catch(console.error) : null
    global.logging_channel = uhg.config.discord.loggingChannel ? await client.channels.fetch(uhg.config.discord.loggingChannel).catch(console.error) : null
    global.debug_channel = uhg.config.discord.debugChannel ?  await client.channels.fetch(uhg.config.discord.debugChannel).catch(console.error) : null

}
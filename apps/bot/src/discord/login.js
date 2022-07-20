
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    allowedMentions: { parse: [ "users", "roles" ], repliedUser: true },
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel, Partials.User, Partials.Message, Partials.GuildMember, Partials.Reaction]
});

module.exports = client
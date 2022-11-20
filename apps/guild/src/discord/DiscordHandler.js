
const { Client, Collection, GatewayIntentBits, Partials, Message } = require('discord.js');
const path = require('node:path');
const fs = require('fs');

const DiscordCache = require('../utils/DiscordCache')
const MessageHandler = require('./handlers/MessageHandler');

let channel;

class DiscordHandler {
  constructor(uhg) {

    this.uhg = uhg

    this.messageHandler = new MessageHandler(this)
  }

  async init() {
    
    global.dc_client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages],
      partials: [Partials.Channel, Partials.GuildMember]
    });

    this.client = dc_client

    this.client.on('messageCreate', message => this.messageHandler.onMessage(message))
    
    this.client.login(this.uhg.config.dev ? process.env.token_test : process.env.token ).catch(e => {console.error(e)})

    DiscordCache(this.uhg, this.client)

    const events = fs.readdirSync(path.join(__dirname, './events')).filter((file) => file.endsWith(".js"));
    let eventsCount = events.length
    for (const file of events) {
      try {
          const event = require(`./events/${file}`)
          this.client.on( file.split(".")[0], event.bind(null, this.uhg));
      } catch (e) {
          console.error(e)
          eventsCount -= 1
      }
    }
    console.discord(`${eventsCount}/${events.length} Events Loaded`)
  }
  
  
  async onBroadcast({ fullMessage, username, message, guildRank, chat }) {
    if (chat != 'debugChannel') console.broadcast(`${username} [${guildRank}]: ${message}`, `Discord`)
    channel = await global[chat?.toLowerCase().replace(/channel/i, '') + '_channel'] || global.guild_channel
    global.guild_channel?.send(message.replace(/@/g, ''))
  }

  async onBroadcastCleanEmbed({ message, color, channel }) {
    if (message.length < config.console.maxEventSize) console.broadcast(message, 'Event')
    channel = global[channel?.toLowerCase() + '_channel'] || global.guild_channel
    channel?.send({
      embeds: [{
        color: color,
        description: message,
      }]
    })
  }

  async onBroadcastHeadedEmbed({ message, title, icon, color, channel }) {
    if (message) if (message.length < config.console.maxEventSize) console.broadcast(message, 'Event')
    channel = global[channel?.toLowerCase() + '_channel'] || global.guild_channel
    channel?.send({
      embeds: [{
        color: color,
        author: {
          name: title,
          icon_url: icon,
        },
        description: message,
      }]
    })
  }

  async onPlayerToggle({ fullMessage, username, message, color, channel}) {
    console.broadcast(username + ' ' + message, 'Event')
    channel = global[chat?.toLowerCase() + '_channel'] || global.guild_channel
    global.guild_channel?.send(message.replace(/@/g, ''))
  }
}

module.exports = DiscordHandler
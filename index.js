require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildInvites
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  }
});

// Global Collections
client.commands = new Collection();
client.buttons = new Collection();
client.cooldowns = new Collection();
client.aliases = new Collection();

// Load Handlers
const handlersPath = path.join(__dirname, 'handlers');
if (fs.existsSync(handlersPath)) {
  const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
  
  for (const file of handlerFiles) {
    const filePath = path.join(handlersPath, file);
    try {
      const handler = require(filePath);
      if (handler.load) {
        handler.load(client);
      }
    } catch (error) {
      console.error(`Error loading handler ${file}:`, error);
    }
  }
}

// Error Handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately to prevent crash loops, but log it
});

// Login
const token = process.env.TOKEN;
if (!token) {
  console.error('❌ No TOKEN found in .env file!');
  process.exit(1);
}

client.login(token).catch(err => {
  console.error('❌ Failed to login:', err.message);
  process.exit(1);
});

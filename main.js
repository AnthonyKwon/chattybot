const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const discord = require('./modules/discord.js');
const configManager = require('./modules/configManager.js');
const logger = require('./modules/logger.js');

const config = configManager.read('status', 'token');
const devFlag = process.env.NODE_ENV === 'development' ? true : false;

/* Logging winston to console on development mode. */
if (devFlag === true) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

/* Discord client */
const client = new Discord.Client();
client.commands = new Discord.Collection();

/* command files */
const commandFiles = fs.readdirSync(path.join(__dirname, '/modules/commands')).filter(file => file.endsWith('.js'));

/* Dyanic command handler */
for (const file of commandFiles) {
    const command = require(path.join(__dirname, '/modules/commands', file));
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    const botStatus = devFlag ? "🔧 점검 중 🔧" : config.status;
    discord.onReady(client, botStatus);
});

client.on('message', discord.onMessage);

client.on('voiceStateUpdate', discord.onVoiceUpdate);

client.login(config.token);

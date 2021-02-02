const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const discord = require('./modules/discord.js');
const configManager = require('./modules/configManager.js');

const config = configManager.read('status', 'token');
const devFlag = process.env.NODE_ENV === 'development' ? true : false;
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, './logs/error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(__dirname, './logs/verbose.log'), level: 'verbose' })
    ]
});

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
    discord.onReady(client, logger, botStatus);
});

client.on('message', (message) => discord.onMessage(message, logger));

client.login(config.token);

module.exports = {
    logger,
}

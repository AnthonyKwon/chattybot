const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const { logger } = require(path.join(__dirname, 'modules/common'));
const config = require('./modules/configLoader');
const music = require('./modules/tannergabriel_yt');
const string = require('./modules/stringResolver');
const { prefix, status, token } = config.load(['prefix', 'status', 'token']);

const client = new Discord.Client();
client.commands = new Discord.Collection();
const pauseState = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, 'modules/commands')).filter(file => file.endsWith('.js'));

/* Dyanic command handler */
for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'modules/commands', file));
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    logger.log('verbose', `[discord.js] Connected to ${client.user.username}!`);
    client.user.setActivity(status, "PLAYING");
});

client.on('message', async message => {
    /* Dyanmic coomand handler */
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) return;

    /* Check argument exists (if required) */
    if (command.argsRequired && !args.length) {
        let reply = string.get('argsRequiredLine1');

        if (command.usage) {
            reply += string.get('argsRequiredLine2').format(prefix, command.name, command.usage);
        }

        return message.channel.send(reply);
    }

    /* Check cooldown past (needs fix) */
    const cooldowns = new Discord.Collection();

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send(string.get('cooldownRemain').format(timeLeft.toFixed(1), command.name));
        }
    }

    try {
        command.execute(message, args);
    } catch (err) {
        logger.log('error', `[discord.js] Failed to launch requested command: ${err}\n${err.body}`);
        message.channel.send(string.get('internalError'));
    }
});

client.login(token);

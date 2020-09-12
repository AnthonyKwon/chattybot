const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const common = require(path.join(__dirname, 'modules/common'));
const config = require(path.join(__dirname, 'modules/configLoader'));
const string = require(path.join(__dirname, 'modules/stringResolver'));
const { prefix, token } = config.load(['prefix', 'token']);
if (!String.prototype.format) {
    String.prototype.format = string.format;
}

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'modules/commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'modules/commands', file));
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    common.logger.log('info', 'Ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if(!command) return;

    if (command.argsRequired && !args.length) {
        let reply = string.get('argsRequiredLine1').format(message.author);

        if (command.usage) {
            reply += string.get('argsRequiredLine2').format(prefix, command.name, command.usage);
        }

        return message.channel.send(reply);
    }

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
            return message.channel.send(string.get('waitForCoolDown').format(timeLeft.toFixed(1), command.name));
        }
    }

    try {
        command.execute(message, args);
    } catch (err) {
        common.logger.log('error', `[discord.js] Failed to launch requested command: ${err}\n${err.body}`);
        message.channel.send(string.get('internalError'));
    }
});

client.login(token);

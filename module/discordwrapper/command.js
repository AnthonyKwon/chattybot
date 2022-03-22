const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const report = require('../errorreport/main.mod');
const common = require('../common.js');
const config = require('../config.js');
const logger = require('../logger.js');
const localize = require('../localization.js');

const cooldown = new Map();

// command files
const commandFiles = fs.readdirSync(path.join(path.dirname(require.main.filename), 'commands')).filter(file => file.endsWith('.js'));

async function onCommand(message) {
   // Ignore command sent from DM or bot
   //TODO: implement DM specific command
   if (message.channel.type === 'dm' || message.author.bot) return;
   // Ignore message without command prefix
    if (!message.content.startsWith(config.prefix)) return false;

    // define command collection if not available
    if (!message.client.commands) {
        message.client.commands = new Discord.Collection();
    // Dynamic command handler
        for (const file of commandFiles) {
            const command = require(path.join(path.dirname(require.main.filename), 'commands', file));
            message.client.commands.set(command.name, command);
        }
    }

    // Get command and argument from message
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = message.client.commands.get(commandName)
        || message.client.commands.find(cmd => localize.commandCheck(commandName, cmd.name))
        || message.client.commands.find(cmd => common.parseAliases(commandName, cmd.aliases));

    // Show unknown command message and return
    if (commandName && !command) {
        message.channel.send(localize.get('error.discord.unknown_command'));
        return false;
    } else if (!commandName) {
        return false;
    }

     // Check argument exists (if required)
     if (command.argsRequired && !args.length) {
        message.channel.send(localize.get('error.discord.args_missing'));
        //TODO: show additional message

        logger.log('error', `[discord.js] ${message.author} tried to use command, but no argument provided!`);
        return false;
    }

    // cooldown mechamism
    if (command.cooldown) {
        /* If user is on cooldown, cancel command run */
        const currentCooldown = cooldown.get(`${message.author.id}:${command.name}`);
        if (currentCooldown && currentCooldown > Date.now()) {
            const timeLeft = Math.round((currentCooldown - Date.now()) / 1000);
            message.channel.send(localize.get('error.discord.ongoing_cooldown', timeLeft));
            logger.log('error', `[discord.js] ${message.author} tried to use command, but cooldown was not passed! (${timeLeft}s)`);
            return false;
        }

        /* Register user on cooldown timer */
        cooldown.set(`${message.author.id}:${command.name}`, Date.now() + (command.cooldown * 1000));
        setTimeout(() => cooldown.delete(`${message.author.id}:${command.name}`), command.cooldown * 1000);
    }

    /* try to run specified command */
    try {
        await command.execute(message, args);
    } catch (err) {
        const result = report(err, message.author.id);
        logger.log('error', `[discord.js] Failed to launch requested command!\n  ${err}`);
        message.channel.send(result);
    }
}

module.exports = onCommand;
